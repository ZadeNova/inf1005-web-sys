<?php
//Owner: Jeremy
//auth logic (login, logout, register)
//session management using raw PDO, no library to keep custom DB structure
//password_hash() / password_verify() functions
namespace App\Services;
class AuthService
{
    //connect to DB using PDO, pass in PDO instance from controller
    private \PDO $db;
    public function __construct(\PDO $db)
    {
        $this->db = $db;
    }
    
    /** 
     * Registration
     * 1. Check if email exists (prevent duplicate)
     * 2. Check if username already exists
     * 3. Hash the password with bcrypt
     * 4. Insert into `users` DB table
     * 5. Create wallet with balance (100)
     * 6. Record signup bonus in wallet_ledger
     */

    public function register(string $email, string $password, string $username): array
    {
        //check if email already exists
        //:email prevents SQL injection, strtolower to standardize email
        $stmt = $this->db->prepare(
            "SELECT id FROM users WHERE email = :email LIMIT 1"
        );
        $stmt->execute([':email' => strtolower($email)]);
        
        //if email exists, return error message
        if ($stmt->fetch()) {
            return [
                'success' => false,
                'message' => 'An account with this email already exists.',
                'userId'  => null,
            ];
        }

        //check if username already exists
        $stmt = $this->db->prepare(
            "SELECT id FROM users WHERE username = :username LIMIT 1"
        );
        $stmt->execute([':username' => $username]);
        
        //if username exists, return error message
        if ($stmt->fetch()) {
            return [
                'success' => false,
                'message' => 'This username is already taken.',
                'userId'  => null,
            ];
        }

        //hash the password with bcrypt
        $hashedPassword = password_hash($password, PASSWORD_BCRYPT);
        //wrap in transaction to ensure all steps succeed or fail together
        try {
            $this->db->beginTransaction();

            //add to user table
            //format:email, password, username, role, verified
            // registered_at uses DEFAULT CURRENT_TIMESTAMP
            $stmt = $this->db->prepare(
                "INSERT INTO users (email, password, username, role, verified)
                 VALUES (:email, :password, :username, 'user', 1)"
            );
            $stmt->execute([
                ':email'    => strtolower($email),
                ':password' => $hashedPassword,
                ':username' => $username,
            ]);
            //get the new user's ID
            $userId = (int) $this->db->lastInsertId();
            //add to wallet table with initial balance of 100
            //stmt is used for prepared statements to prevent SQL injection, execute with parameters
            $stmt = $this->db->prepare(
                "INSERT INTO wallets (user_id, balance)
                 VALUES (:uid, :bal)"
            );
            $stmt->execute([':uid' => $userId, ':bal' => 100.00]);
            //record signup bonus in wallet_ledger
            $stmt = $this->db->prepare(
                "INSERT INTO wallet_ledger
                    (user_id, transaction_ref, type, amount, balance_before, balance_after, reason)
                VALUES
                    (:uid, :ref, 'credit', :amount, 0.00, :balance_after, 'signup_bonus')"
            );
           $stmt->execute([
                ':uid'           => $userId,
                ':ref'           => 'SIGNUP-' . $userId . '-' . time(),
                ':amount'        => 100.00,
                ':balance_after' => 100.00,
            ]);
            //commit to DB
            $this->db->commit();
            //return success message with redirect URL
            return [
                'success'  => true,
                'message'  => 'Account created successfully.',
                'redirect' => '/login',
                'userId'   => $userId,
            ];
            
        }catch (\PDOException $e) {
            //rollback if any step fails to maintain data integrity
            $this->db->rollBack();
            error_log('AuthService::register DB error: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Registration failed. Please try again.',
                'userId'  => null,
            ];
        }
    }
    /**
     * Login
     * 
     * 1. Lookup Email
     * 2. Check account is verified
     * 3. password_verify() to check password - timing safe
     * 4. session_regenerate_id(true) prevents session fixation
     * 5. Store user_id in $_SESSION
     * 6. Update last_login_at timestamp
     */
    public function login(string $email, string $password): array
    {
        //Lookup user by email
        $stmt = $this->db->prepare(
            "SELECT id, email, password, username, role, verified
             FROM users
             WHERE email = :email
             LIMIT 1"
        );
        $stmt->execute([':email' => strtolower($email)]);
        $user = $stmt->fetch(\PDO::FETCH_ASSOC);

        //user not found
        //vague message to prevent user enumeration attacks
        if (!$user) {
            return [
                'success' => false,
                'message' => 'Invalid email or password.',
                'user'    => null,
            ];
        }
        //account not verified
        if (!$user['verified']) {
            return [
                'success' => false,
                'message' => 'Account not verified.',
                'user'    => null,
            ];
        }

        /** 
         * Password Verification
         * password_verify() is timing safe and handles bcrypt hashes
         * 1. Extract Salt
         * 2. Hashes plaintext password with same salt and cost
         * 3. Compares using timing safe comparison to prevent timing attacks
         */

        if (!password_verify($password, $user['password'])) {
            return [
                'success' => false,
                'message' => 'Invalid email or password.',
                'user'    => null,
            ];
        }

        //Password matches, login successful
        //creates new session ID, deletes old session
        //update session cookie in browser
        session_regenerate_id(true);

        //store user data in session, only store necessary info to minimize session data
        $_SESSION['user_id'] = $user['id']; //used for all auth checks
        $_SESSION['user_role'] = $user['role'];//isAdmin() checks this for admin access control
        $_SESSION['username']  = $user['username'];  // used by PageController for dashboard greeting

        //Regenerate CSRF token on login to prevent session fixation attacks
        //Invalidate old token and generate new one
        //frontend fetches new token after login from meta tag
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));

        //Update last_login_at timestamp
        $stmt = $this->db->prepare(
            "UPDATE users SET last_login_at = NOW() WHERE id = :id"
        );
        $stmt->execute([':id' => $user['id']]);
        //return without password hash for security
        $userData = $this->getCurrentUser();
        return [
            'success'  => true,
            'message'  => 'Login successful.',
            'redirect' => '/dashboard',
            'user'     => $userData,
        ];
    }

    //Logout
    //1. Clear all session data ($_SESSION = [])
    //2. Delete the session cookie from the browser
    //3. Destroy the session file on the server
    //isLoggedIn() return False
    public function logout(): void
    {
        // Clear session data
        $_SESSION = [];

        // Delete the session cookie
        if (ini_get('session.use_cookies')) {
            $params = session_get_cookie_params();
            setcookie(
                session_name(),
                '',
                time() - 42000,
                $params['path'],
                $params['domain'],
                $params['secure'],
                $params['httponly']
            );
        }

        // Destroy the session file on the server
        session_destroy();
    }
    
    //Session Checks
    //Checks $_SESSION['user_id'] which is set during login()
    public function isLoggedIn(): bool
    {
        return isset($_SESSION['user_id']) && $_SESSION['user_id'] > 0;
    }

    //get current logged in user ID
    //returns user ID or null if not logged in
    public function getUserId(): ?int
    {
        return $_SESSION['user_id'] ?? null;
    }

    //get full user data for current session (except password)
    //join user and balance for single query
    //returns array or null if not logged in
    public function getCurrentUser(): ?array
    {
        if (!$this->isLoggedIn()) {
            return null;
        }

        // Column names match init.sql exactly
        $stmt = $this->db->prepare(
            "SELECT u.id, u.email, u.username, u.role, u.verified,
                    u.registered_at, u.last_login_at,
                    COALESCE(w.balance, 0.00) AS balance
             FROM users u
             LEFT JOIN wallets w ON w.user_id = u.id
             WHERE u.id = :id
             LIMIT 1"
        );
        $stmt->execute([':id' => $_SESSION['user_id']]);
        return $stmt->fetch(\PDO::FETCH_ASSOC) ?: null;
    }
    //Check if current user has admin role
    public function isAdmin(): bool
    {
        if (!$this->isLoggedIn()) {
            return false;
        }

        // Use cached session value if available
        if (isset($_SESSION['user_role'])) {
            return $_SESSION['user_role'] === 'admin';
        }

        // Fallback: query the database
        $stmt = $this->db->prepare(
            "SELECT role FROM users WHERE id = :id"
        );
        $stmt->execute([':id' => $_SESSION['user_id']]);
        $row = $stmt->fetch(\PDO::FETCH_ASSOC);

        // Cache it for next time
        if ($row) {
            $_SESSION['user_role'] = $row['role'];
        }

        return $row && $row['role'] === 'admin';
    }

    /**
 * Change Password
 * 1. Fetch current hashed password from DB
 * 2. Verify current password with password_verify()
 * 3. Hash new password with bcrypt
 * 4. Update users table
 */
public function changePassword(int $userId, string $currentPassword, string $newPassword): array
{
    // Fetch current password hash
    $stmt = $this->db->prepare(
        "SELECT password FROM users WHERE id = :id LIMIT 1"
    );
    $stmt->execute([':id' => $userId]);
    $user = $stmt->fetch(\PDO::FETCH_ASSOC);

    if (!$user) {
        return ['success' => false, 'message' => 'User not found.'];
    }

    // Verify current password is correct
    if (!password_verify($currentPassword, $user['password'])) {
        return ['success' => false, 'message' => 'Current password is incorrect.'];
    }

    // Hash and save new password
    $hashed = password_hash($newPassword, PASSWORD_BCRYPT);

    $stmt = $this->db->prepare(
        "UPDATE users SET password = :password WHERE id = :id"
    );
    $stmt->execute([':password' => $hashed, ':id' => $userId]);

    return ['success' => true, 'message' => 'Password updated successfully.'];
}
}







