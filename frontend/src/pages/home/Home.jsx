import { useState, useEffect } from "react";

export default function Home() {
	const [status, setStatus] = useState("Loading...");
	const [message, setMessage] = useState("");
	const [error, setError] = useState("");

	useEffect(() => {
		fetch("/api/test")
			.then((res) => res.json())
			.then((data) => {
				setStatus(data.status);
				setMessage(data.message);
			})
			.catch(() => setError("Failed to connect to backend."));
	}, []);

	return (
		<div className="min-h-screen bg-gray-100 flex items-center justify-center">
			<div className="bg-white p-10 rounded-xl shadow-md text-center space-y-4">
				<h1 className="text-3xl font-bold text-blue-600">Connection Test</h1>
				{error ? (
					<div className="bg-red-100 text-red-600 px-4 py-2 rounded">
						❌ {error}
					</div>
				) : (
					<div className="space-y-2">
						<div className="bg-green-100 text-green-700 px-4 py-2 rounded">
							✅ Status: <strong>{status}</strong>
						</div>
						<div className="bg-blue-100 text-blue-700 px-4 py-2 rounded">
							💬 Message: <strong>{message}</strong>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
