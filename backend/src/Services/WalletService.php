<?php
// backend/src/Services/WalletService.php

namespace App\Services;

class WalletService
{
    private \PDO $db;

    public function __construct(\PDO $db)
    {
        $this->db = $db;
    }

    /**
     * Simple balance read. Used by PortfolioController.
     * Not called during a purchase — MarketService already has the balance
     * from its FOR UPDATE lock.
     */
    public function getBalance(int $userId): float
    {
        $stmt = $this->db->prepare(
            "SELECT balance FROM wallets WHERE user_id = :uid LIMIT 1"
        );
        $stmt->execute([':uid' => $userId]);
        $row = $stmt->fetch(\PDO::FETCH_ASSOC);

        return $row ? (float) $row['balance'] : 0.0;
    }

    /**
     * Deduct money from a user's wallet.
     * Called by MarketService::executePurchase() inside a transaction.
     *
     * $balanceBefore is passed in — DO NOT re-query the wallet here.
     * The row is already locked upstream with FOR UPDATE.
     */
    public function debit(
        int    $userId,
        float  $amount,
        string $reason,
        string $transactionRef,
        float  $balanceBefore
    ): void {
        $balanceAfter = round($balanceBefore - $amount, 2);

        // Update the wallet balance
        $stmt = $this->db->prepare(
            "UPDATE wallets SET balance = :bal WHERE user_id = :uid"
        );
        $stmt->execute([':bal' => $balanceAfter, ':uid' => $userId]);

        // Write the audit entry
        $this->writeLedger($userId, $transactionRef, 'debit', $amount, $balanceBefore, $balanceAfter, $reason);
    }

    /**
     * Add money to a user's wallet.
     * Same rules as debit() — called within MarketService's transaction.
     */
    public function credit(
        int    $userId,
        float  $amount,
        string $reason,
        string $transactionRef,
        float  $balanceBefore
    ): void {
        $balanceAfter = round($balanceBefore + $amount, 2);

        $stmt = $this->db->prepare(
            "UPDATE wallets SET balance = :bal WHERE user_id = :uid"
        );
        $stmt->execute([':bal' => $balanceAfter, ':uid' => $userId]);

        $this->writeLedger($userId, $transactionRef, 'credit', $amount, $balanceBefore, $balanceAfter, $reason);
    }

    /**
     * Private helper — writes one row to wallet_ledger.
     * Not exposed publicly because nothing should call this directly.
     * Every ledger entry must come from a debit or credit operation.
     */
    private function writeLedger(
        int    $userId,
        string $transactionRef,
        string $type,
        float  $amount,
        float  $balanceBefore,
        float  $balanceAfter,
        string $reason
    ): void {
        $stmt = $this->db->prepare("
            INSERT INTO wallet_ledger
                (user_id, transaction_ref, type, amount, balance_before, balance_after, reason)
            VALUES
                (:uid, :ref, :type, :amount, :before, :after, :reason)
        ");
        $stmt->execute([
            ':uid'    => $userId,
            ':ref'    => $transactionRef,
            ':type'   => $type,
            ':amount' => $amount,
            ':before' => $balanceBefore,
            ':after'  => $balanceAfter,
            ':reason' => $reason,
        ]);
    }

    /**
     * Returns recent ledger entries for a user.
     * Used by PortfolioController for the wallet history view.
     */
    public function getLedger(int $userId, int $limit = 20): array
    {
        $stmt = $this->db->prepare("
            SELECT type, amount, balance_before, balance_after, reason, transaction_ref, created_at
            FROM wallet_ledger
            WHERE user_id = :uid
            ORDER BY created_at DESC
            LIMIT :limit
        ");
        $stmt->bindValue(':uid',   $userId, \PDO::PARAM_INT);
        $stmt->bindValue(':limit', $limit,  \PDO::PARAM_INT);
        $stmt->execute();

        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }
}