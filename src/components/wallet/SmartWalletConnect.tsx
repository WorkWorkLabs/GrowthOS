"use client";

import { useState } from "react";
import { useWallet } from "@/hooks/useWallet";
import { useAuth } from "@/providers/AuthProvider";

interface SmartWalletConnectProps {
  onSuccess?: (address: string) => void;
  onError?: (error: string) => void;
  className?: string;
  showBalance?: boolean;
}

export function SmartWalletConnect({
  onSuccess,
  onError,
  className = "",
  showBalance = true,
}: SmartWalletConnectProps) {
  const {
    address,
    isConnected,
    isConnecting,
    isBinding,
    balance,
    connectAndBind,
    disconnect,
  } = useWallet();

  const { profile, user } = useAuth();
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const handleConnect = async () => {
    if (!user) {
      const errorMsg = "Please login first to connect wallet";
      setError(errorMsg);
      onError?.(errorMsg);
      return;
    }

    setError("");
    setSuccess("");

    try {
      const result = await connectAndBind();
      const successMsg = `Wallet ${formatAddress(result.address)} connected successfully!`;
      setSuccess(successMsg);
      onSuccess?.(result.address);
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : "Wallet connection failed";
      setError(errorMsg);
      onError?.(errorMsg);
    }
  };

  const handleDisconnect = () => {
    disconnect();
    setError("");
    setSuccess("");
  };

  const getButtonText = () => {
    if (isBinding) return "Binding wallet...";
    if (isConnecting) return "Connecting...";
    if (isConnected && address) return `Connected: ${formatAddress(address)}`;
    return "Connect Phantom";
  };

  const getButtonStyle = () => {
    if (isBinding || isConnecting) {
      return "bg-gray-400 cursor-not-allowed";
    }
    if (isConnected && address) {
      return "bg-green-500 hover:bg-green-600";
    }
    return "bg-primary hover:bg-blue-600";
  };

  // 检查钱包是否已绑定到当前账户
  const isWalletBound = profile?.walletAddress === address;

  return (
    <div className={`space-y-3 ${className}`}>
      {/* 状态显示 */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <p className="text-green-600 text-sm">{success}</p>
        </div>
      )}

      {/* 主要操作按钮 */}
      <div className="flex items-center gap-2">
        <button
          onClick={isConnected && address ? handleDisconnect : handleConnect}
          disabled={isConnecting || isBinding}
          className={`${getButtonStyle()} text-white px-4 py-2 rounded-lg transition-colors flex-1`}
        >
          {getButtonText()}
        </button>

        {isConnected && address && (
          <button
            onClick={handleDisconnect}
            className="bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 transition-colors"
          >
            Disconnect
          </button>
        )}
      </div>

      {/* 钱包信息展示 */}
      {isConnected && address && (
        <div className="bg-white rounded-lg p-3 border">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Wallet Address:</span>
              <span className="font-mono text-sm">
                {formatAddress(address)}
              </span>
            </div>

            {showBalance && balance && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">SOL Balance:</span>
                <span className="font-mono text-sm">{balance} SOL</span>
              </div>
            )}

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Binding Status:</span>
              <span
                className={`text-sm font-medium ${isWalletBound ? "text-green-600" : "text-green-600"}`}
              >
                {isWalletBound ? "Bound to Account" : "Bound to Account"}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 使用提示 */}
      {!user && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-blue-600 text-sm">
            💡 Tip: Please login first, then connect Phantom wallet for
            identity verification
          </p>
        </div>
      )}

      {user && !isConnected && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
          <p className="text-gray-600 text-sm">
            🔐 After connecting wallet, system will ask you to sign a message to
            verify ownership, no gas fee required
          </p>
        </div>
      )}
    </div>
  );
}