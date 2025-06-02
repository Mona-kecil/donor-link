"use client";

import { useSession } from "next-auth/react";
import { useWallet } from "@solana/wallet-adapter-react";
import ConnectWalletButton from "~/components/navigations/connect-wallet-button";
import { SigninMessage } from "~/utils/SigninMessage";
import bs58 from "bs58";
import { useState } from "react";

export default function DebugAuthPage() {
  const { data: session, status } = useSession();
  const { connected, publicKey, wallet, signMessage } = useWallet();
  const [testResult, setTestResult] = useState<string>("");

  const testSignature = async () => {
    if (!publicKey || !signMessage) {
      setTestResult("❌ Wallet not connected or can't sign");
      return;
    }

    try {
      const testMessage = new SigninMessage({
        domain: window.location.host,
        publicKey: publicKey.toBase58(),
        statement: "Test message",
        nonce: "test-nonce-123",
      });

      const messageToSign = testMessage.prepare();
      console.log("🧪 Test message:", messageToSign);

      const data = new TextEncoder().encode(messageToSign);
      const signature = await signMessage(data);
      const serializedSignature = bs58.encode(signature);

      console.log("🧪 Test signature:", serializedSignature);

      const isValid = await testMessage.validate(serializedSignature);
      console.log("🧪 Test validation result:", isValid);

      setTestResult(`✅ Signature test ${isValid ? "PASSED" : "FAILED"}`);
    } catch (error) {
      console.error("🧪 Test error:", error);
      setTestResult(`❌ Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Authentication Debug Page</h1>

      <div className="space-y-6">
        {/* Wallet Connection Info */}
        <div className="border rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-4">Wallet Connection</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Connected:</strong> {connected ? "✅ Yes" : "❌ No"}
            </div>
            <div>
              <strong>Wallet:</strong> {wallet?.adapter?.name || "None"}
            </div>
            <div>
              <strong>Public Key:</strong> {publicKey?.toBase58() || "None"}
            </div>
            <div>
              <strong>Can Sign:</strong> {signMessage ? "✅ Yes" : "❌ No"}
            </div>
          </div>
        </div>

        {/* NextAuth Session Info */}
        <div className="border rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-4">NextAuth Session</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Status:</strong>
              <span className={`ml-2 px-2 py-1 rounded text-xs ${status === "authenticated" ? "bg-green-100 text-green-800" :
                status === "unauthenticated" ? "bg-red-100 text-red-800" :
                  "bg-yellow-100 text-yellow-800"
                }`}>
                {status}
              </span>
            </div>
            <div>
              <strong>Has Session:</strong> {session ? "✅ Yes" : "❌ No"}
            </div>
          </div>

          {session && (
            <div className="mt-4 p-3 bg-gray-50 rounded">
              <strong>Session Data:</strong>
              <pre className="mt-2 text-xs overflow-auto">
                {JSON.stringify(session, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Signature Test */}
        <div className="border rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-4">Signature Test</h2>
          <div className="space-y-4">
            <button
              onClick={testSignature}
              disabled={!connected || !publicKey || !signMessage}
              className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
            >
              Test Signature Validation
            </button>
            {testResult && (
              <div className="p-3 bg-gray-50 rounded">
                <strong>Test Result:</strong> {testResult}
              </div>
            )}
          </div>
        </div>

        {/* Connect Wallet Button */}
        <div className="border rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-4">Actions</h2>
          <ConnectWalletButton />
        </div>

        {/* Instructions */}
        <div className="border rounded-lg p-4 bg-blue-50">
          <h2 className="text-xl font-semibold mb-4">Debug Instructions</h2>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Open browser developer tools (F12)</li>
            <li>Go to the Console tab</li>
            <li>Click "Test Signature Validation" to verify crypto works</li>
            <li>Click "Connect Wallet" and choose a wallet</li>
            <li>Watch the console for detailed authentication logs</li>
            <li>Check if the session status changes to "authenticated"</li>
          </ol>
        </div>
      </div>
    </div>
  );
} 