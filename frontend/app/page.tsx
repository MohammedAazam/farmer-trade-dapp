"use client";

import React, { useEffect, useState } from "react";
import {
  Sprout,
  Wallet,
  Gavel,
  Handshake,
  Landmark,
  PlusCircle,
  CheckCircle2,
  Clock,
  DollarSign,
  Package,
  AlertCircle
} from "lucide-react";

import { ethers } from "ethers";
import {
  AUCTION_ADDRESS,
  FORWARD_ADDRESS,
  CREDIT_ADDRESS,
  AUCTION_ABI,
  FORWARD_ABI,
  CREDIT_ABI
} from "../lib/contract";

// Declare window types for MetaMask
declare global {
  interface Window {
    ethereum?: any;
  }
}

// --- UI Components ---

const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden ${className}`}>
    {children}
  </div>
);

const Badge = ({ children, type = "neutral" }: { children: React.ReactNode; type?: string }) => {
  const styles: Record<string, string> = {
    neutral: "bg-slate-100 text-slate-600",
    success: "bg-emerald-100 text-emerald-700",
    warning: "bg-amber-100 text-amber-700",
    danger: "bg-rose-100 text-rose-700",
    primary: "bg-blue-100 text-blue-700",
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[type] || styles.neutral}`}>
      {children}
    </span>
  );
};

interface ButtonProps {
  onClick?: () => void;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  className?: string;
  icon?: React.ComponentType<{ size: number }>;
  disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  onClick,
  children,
  variant = "primary",
  className = "",
  icon: Icon,
  disabled
}) => {
  const base =
    "inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-all focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed";
  const variants: Record<string, string> = {
    primary:
      "bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500 shadow-md shadow-emerald-200",
    secondary:
      "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 focus:ring-slate-200",
    danger: "bg-rose-600 text-white hover:bg-rose-700 focus:ring-rose-500",
    ghost: "text-slate-600 hover:bg-slate-100",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant] || variants.primary} ${className}`}
    >
      {Icon && <Icon size={18} />}
      {children}
    </button>
  );
};

interface InputProps {
  label?: string;
  icon?: React.ComponentType<{ size: number }>;
  [key: string]: any;
}

const Input: React.FC<InputProps> = ({ label, icon: Icon, ...props }) => (
  <div className="space-y-1">
    {label && <label className="text-sm font-medium text-slate-700 block">{label}</label>}
    <div className="relative">
      {Icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
          <Icon size={18} />
        </div>
      )}
      <input
        className={`w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-lg py-2.5 ${
          Icon ? "pl-10" : "pl-3"
        } pr-3 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400`}
        {...props}
      />
    </div>
  </div>
);

// --- Main Application ---

export default function Home() {
  const [account, setAccount] = useState("");
  const [auction, setAuction] = useState<ethers.Contract | null>(null);
  const [forward, setForward] = useState<ethers.Contract | null>(null);
  const [credit, setCredit] = useState<ethers.Contract | null>(null);

  const [mainTab, setMainTab] = useState("auction");
  const [subTab, setSubTab] = useState("list");

  // Form States
  const [cropId, setCropId] = useState("");
  const [bidAmount, setBidAmount] = useState("");
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");

  const [dealCrop, setDealCrop] = useState("");
  const [dealQty, setDealQty] = useState("");
  const [dealPrice, setDealPrice] = useState("");
  const [deliveryTime, setDeliveryTime] = useState("");

  const [loanAmount, setLoanAmount] = useState("");

  // Data States
  const [crops, setCrops] = useState([]);
  const [deals, setDeals] = useState([]);
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // --- Web3 Logic ---

  useEffect(() => {
    if (typeof window !== "undefined" && window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          initializeContracts(accounts[0]);
        } else {
          setAccount("");
          setAuction(null);
          setForward(null);
          setCredit(null);
          setError("");
        }
      };

      window.ethereum.on("accountsChanged", handleAccountsChanged);

      return () => {
        if (window.ethereum) {
          window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
        }
      };
    }
  }, []);

  async function initializeContracts(addressOrSigner: any) {
    try {
      let signer;
      
      if (typeof addressOrSigner === 'string') {
        // If it's an address string, get the provider and signer
        const provider = new ethers.BrowserProvider(window.ethereum);
        signer = await provider.getSigner();
      } else {
        signer = addressOrSigner;
      }

      const auctionC = new ethers.Contract(AUCTION_ADDRESS, AUCTION_ABI, signer);
      const forwardC = new ethers.Contract(FORWARD_ADDRESS, FORWARD_ABI, signer);
      const creditC = new ethers.Contract(CREDIT_ADDRESS, CREDIT_ABI, signer);

      setAuction(auctionC);
      setForward(forwardC);
      setCredit(creditC);

      // Initial Fetch
      await refreshAll(auctionC, forwardC, creditC);
    } catch (err) {
      console.error("Contract initialization failed:", err);
      setError("Failed to initialize contracts. Ensure you're on the correct network.");
    }
  }

  async function connectWallet() {
    if (!window.ethereum) {
      setError("Please install MetaMask to use this dApp.");
      return;
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);

      // Request account access
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });

      if (!accounts || accounts.length === 0) {
        setError("No accounts found. Please connect an account in MetaMask.");
        return;
      }

      setAccount(accounts[0]);
      setError("");

      // Get signer and initialize contracts
      const signer = await provider.getSigner();
      await initializeContracts(signer);
    } catch (err: any) {
      console.error("Connection failed:", err);
      if (err.code === 4001) {
        setError("Connection rejected by user.");
      } else if (err.code === -32002) {
        setError("MetaMask request already pending. Please check MetaMask.");
      } else {
        setError("Failed to connect wallet. " + (err.message || ""));
      }
    }
  }

  async function refreshAll(auctionC: any, forwardC: any, creditC: any) {
    setLoading(true);
    try {
      await Promise.all([
        fetchCrops(auctionC || auction),
        fetchDeals(forwardC || forward),
        fetchLoans(creditC || credit)
      ]);
    } catch (err) {
      console.error("Error refreshing data:", err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchCrops(contract: any) {
    if (!contract) return;
    try {
      const count = await contract.cropCount();
      const arr = [];
      for (let i = 1; i <= Number(count); i++) {
        const c = await contract.crops(i);
        const bid = await contract.highestBids(i);
        arr.push({
          id: c[0].toString(),
          farmer: c[1],
          name: c[2],
          quantity: c[3].toString(),
          basePrice: ethers.formatEther(c[4]),
          active: c[5],
          highestBid: ethers.formatEther(bid[1]),
          highestBidder: bid[0]
        });
      }
      setCrops(arr);
    } catch (e) {
      console.error("Error fetching crops:", e);
    }
  }

  async function fetchDeals(contract: any) {
    if (!contract) return;
    try {
      const count = await contract.dealCount();
      const arr = [];
      for (let i = 1; i <= Number(count); i++) {
        const d = await contract.deals(i);
        arr.push({
          id: d[0].toString(),
          crop: d[3],
          quantity: d[4].toString(),
          price: ethers.formatEther(d[5]),
          accepted: d[7],
          completed: d[8]
        });
      }
      setDeals(arr);
    } catch (e) {
      console.error("Error fetching deals:", e);
    }
  }

  async function fetchLoans(contract: any) {
    if (!contract) return;
    try {
      const count = await contract.loanCount();
      const arr = [];
      for (let i = 1; i <= Number(count); i++) {
        const l = await contract.loans(i);
        arr.push({
          id: l[0].toString(),
          amount: ethers.formatEther(l[3]),
          repaid: ethers.formatEther(l[4]),
          active: l[5]
        });
      }
      setLoans(arr);
    } catch (e) {
      console.error("Error fetching loans:", e);
    }
  }

  // --- Transactions ---

  const handleTransaction = async (fn: () => Promise<any>) => {
    if (!account) {
      setError("Connect wallet first");
      return;
    }
    if (!auction || !forward || !credit) {
      setError("Contracts not initialized. Please reconnect wallet.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await fn();
      await refreshAll(auction, forward, credit);
    } catch (error: any) {
      console.error(error);
      const errorMsg = error.reason || error.message || "Unknown error occurred";
      setError("Transaction failed: " + errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // --- Render Helpers ---

  const renderAuction = () => (
    <div className="grid lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1 space-y-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <PlusCircle className="text-emerald-500" /> Actions
          </h3>

          <div className="flex bg-slate-100 p-1 rounded-lg mb-6">
            {["list", "bid", "end"].map((tab) => (
              <button
                key={tab}
                onClick={() => setSubTab(tab)}
                className={`flex-1 py-1.5 text-sm font-medium rounded-md capitalize transition-all ${
                  subTab === tab
                    ? "bg-white text-white shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {subTab === "list" && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
              <Input
                label="Crop Name"
                placeholder="e.g. Wheat"
                value={name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                icon={Sprout}
              />
              <Input
                label="Quantity (kg)"
                placeholder="1000"
                type="number"
                value={quantity}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuantity(e.target.value)}
                icon={Package}
              />
              <Input
                label="Base Price (ETH)"
                placeholder="0.5"
                type="number"
                value={price}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPrice(e.target.value)}
                icon={DollarSign}
              />
              <Button
                onClick={() =>
                  handleTransaction(async () => {
                    if (!auction) throw new Error("Auction contract not initialized");
                    const tx = await auction.listCrop(
                      name,
                      Number(quantity),
                      ethers.parseEther(price)
                    );
                    await tx.wait();
                  })
                }
                className="w-full mt-2"
              >
                List Crop
              </Button>
            </div>
          )}

          {subTab === "bid" && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
              <Input
                label="Crop ID"
                placeholder="#"
                value={cropId}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCropId(e.target.value)}
                icon={Package}
              />
              <Input
                label="Bid Amount (ETH)"
                placeholder="0.6"
                type="number"
                value={bidAmount}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBidAmount(e.target.value)}
                icon={DollarSign}
              />
              <Button
                onClick={() =>
                  handleTransaction(async () => {
                    if (!auction) throw new Error("Auction contract not initialized");
                    const tx = await auction.bid(Number(cropId), {
                      value: ethers.parseEther(bidAmount)
                    });
                    await tx.wait();
                  })
                }
                className="w-full mt-2"
                variant="primary"
              >
                Place Bid
              </Button>
            </div>
          )}

          {subTab === "end" && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
              <div className="bg-rose-50 text-rose-800 p-3 rounded-lg text-sm border border-rose-100 flex gap-2">
                <AlertCircle size={16} className="mt-0.5" />
                Only the farmer who listed the crop can end the auction.
              </div>
              <Input
                label="Crop ID to End"
                placeholder="#"
                value={cropId}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCropId(e.target.value)}
                icon={Package}
              />
              <Button
                onClick={() =>
                  handleTransaction(async () => {
                    if (!auction) throw new Error("Auction contract not initialized");
                    const tx = await auction.endAuction(Number(cropId));
                    await tx.wait();
                  })
                }
                className="w-full mt-2"
                variant="danger"
              >
                Close Auction
              </Button>
            </div>
          )}
        </Card>
      </div>

      <div className="lg:col-span-2">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-800">Live Market</h2>
          <span className="text-sm text-slate-500">{crops.length} listings</span>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {crops.map((c) => (
            <Card key={c.id} className="hover:shadow-md transition-shadow">
              <div className="p-5">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                      <Sprout size={20} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">{c.name}</h4>
                      <p className="text-xs text-slate-500">ID: #{c.id}</p>
                    </div>
                  </div>
                  <Badge type={c.active ? "success" : "neutral"}>
                    {c.active ? "Active" : "Closed"}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                  <div>
                    <p className="text-slate-500 text-xs">Quantity</p>
                    <p className="font-medium">{c.quantity} kg</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Base Price</p>
                    <p className="font-medium">{c.basePrice} ETH</p>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-lg p-3 flex justify-between items-center">
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wide">Highest Bid</p>
                    <p className="font-bold text-emerald-600">
                      {Number(c.highestBid) > 0 ? `${c.highestBid} ETH` : "No Bids"}
                    </p>
                  </div>
                  {c.active && (
                    <button
                      onClick={() => {
                        setSubTab("bid");
                        setCropId(c.id);
                      }}
                      className="text-xs bg-white border border-slate-200 hover:bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-md font-medium transition-colors"
                    >
                      Bid Now
                    </button>
                  )}
                </div>
              </div>
            </Card>
          ))}
          {crops.length === 0 && (
            <div className="col-span-full py-12 text-center text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">
              <Sprout className="mx-auto mb-2 opacity-50" size={32} />
              No active listings found
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderForward = () => (
    <div className="grid lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1 space-y-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Handshake className="text-blue-500" /> Trading Desk
          </h3>
          <div className="flex bg-slate-100 p-1 rounded-lg mb-6">
            {["create", "accept", "confirm"].map((tab) => (
              <button
                key={tab}
                onClick={() => setSubTab(tab)}
                className={`flex-1 py-1.5 text-sm font-medium rounded-md capitalize transition-all ${
                  subTab === tab
                    ? "bg-white text-white shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {subTab === "create" && (
            <div className="space-y-4">
              <Input
                label="Crop Name"
                value={dealCrop}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDealCrop(e.target.value)}
                icon={Sprout}
              />
              <Input
                label="Quantity"
                value={dealQty}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDealQty(e.target.value)}
                icon={Package}
              />
              <Input
                label="Price (ETH)"
                value={dealPrice}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDealPrice(e.target.value)}
                icon={DollarSign}
              />
              <Input
                label="Delivery Time (days)"
                value={deliveryTime}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDeliveryTime(e.target.value)}
                icon={Clock}
              />
              <Button
                onClick={() =>
                  handleTransaction(async () => {
                    if (!forward) throw new Error("Forward contract not initialized");
                    const tx = await forward.createDeal(
                      dealCrop,
                      Number(dealQty),
                      ethers.parseEther(dealPrice),
                      Math.floor(Date.now() / 1000) + (Number(deliveryTime) * 24 * 60 * 60)
                    );
                    await tx.wait();
                  })
                }
                className="w-full mt-2"
                variant="primary"
              >
                Create Contract
              </Button>
            </div>
          )}

          {subTab === "accept" && (
            <div className="space-y-4">
              <div className="bg-blue-50 text-blue-800 p-3 rounded-lg text-sm border border-blue-100">
                You must send the exact ETH value to accept a deal.
              </div>
              <Input
                label="Deal ID"
                value={cropId}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCropId(e.target.value)}
                icon={Package}
              />
              <Input
                label="Confirm Price (ETH)"
                value={dealPrice}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDealPrice(e.target.value)}
                icon={DollarSign}
              />
              <Button
                onClick={() =>
                  handleTransaction(async () => {
                    if (!forward) throw new Error("Forward contract not initialized");
                    const tx = await forward.acceptDeal(Number(cropId), {
                      value: ethers.parseEther(dealPrice)
                    });
                    await tx.wait();
                  })
                }
                className="w-full mt-2"
                variant="primary"
              >
                Accept & Pay
              </Button>
            </div>
          )}

          {subTab === "confirm" && (
            <div className="space-y-4">
              <Input
                label="Deal ID to Confirm"
                value={cropId}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCropId(e.target.value)}
                icon={CheckCircle2}
              />
              <Button  
                onClick={() =>
                  handleTransaction(async () => {
                    if (!forward) throw new Error("Forward contract not initialized");
                    const tx = await forward.confirmDelivery(Number(cropId));
                    await tx.wait();
                  })
                }
                className="w-full mt-2"
                variant="secondary"
              >
                Confirm Delivery
              </Button>
            </div>
          )}
        </Card>
      </div>

      <div className="lg:col-span-2">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-800">Forward Contracts</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {deals.map((d) => (
            <Card key={d.id} className="relative overflow-visible">
              {d.completed && (
                <div className="absolute -right-2 -top-2 bg-emerald-500 text-white p-1 rounded-full shadow-lg">
                  <CheckCircle2 size={16} />
                </div>
              )}
              <div className="p-5 border-l-4 border-l-blue-500 h-full">
                <div className="flex justify-between mb-2">
                  <h4 className="font-bold text-white">{d.crop}</h4>
                  <span className="text-xs text-slate-400">#{d.id}</span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between border-b border-slate-100 pb-2">
                    <span className="text-slate-500">Amount</span>
                    <span className="font-medium">{d.quantity} units</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-2">
                    <span className="text-slate-500">Value</span>
                    <span className="font-medium">{d.price} ETH</span>
                  </div>
                  <div className="flex justify-between pt-1">
                    <span className="text-slate-500">Status</span>
                    <Badge type={d.completed ? "success" : d.accepted ? "primary" : "neutral"}>
                      {d.completed ? "Delivered" : d.accepted ? "In Progress" : "Open"}
                    </Badge>
                  </div>
                </div>
                {!d.completed && !d.accepted && (
                  <Button
                    variant="ghost"
                    className="w-full mt-4 text-xs border border-dashed border-slate-300"
                    onClick={() => {
                      setSubTab("accept");
                      setCropId(d.id);
                      setDealPrice(d.price);
                    }}
                  >
                    Select to Accept
                  </Button>
                )}
              </div>
            </Card>
          ))}
          {deals.length === 0 && (
            <div className="col-span-full py-12 text-center text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">
              <Handshake className="mx-auto mb-2 opacity-50" size={32} />
              No active contracts
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderCredit = () => (
    <div className="grid lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1 space-y-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Landmark className="text-purple-500" /> Micro-Credit
          </h3>
          <div className="flex bg-slate-100 p-1 rounded-lg mb-6">
            {["request", "approve", "repay"].map((tab) => (
              <button
                key={tab}
                onClick={() => setSubTab(tab)}
                className={`flex-1 py-1.5 text-sm font-medium rounded-md capitalize transition-all ${
                  subTab === tab
                    ? "bg-white text-white shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {subTab === "request" && (
            <div className="space-y-4">
              <Input
                label="Loan Amount (ETH)"
                value={loanAmount}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLoanAmount(e.target.value)}
                icon={DollarSign}
              />
              <Button
                onClick={() =>
                  handleTransaction(async () => {
                    if (!credit) throw new Error("Credit contract not initialized");
                    const tx = await credit.requestLoan(ethers.parseEther(loanAmount));
                    await tx.wait();
                  })
                }
                className="w-full mt-2 bg-purple-600 hover:bg-purple-700"
              >
                Request Funds
              </Button>
            </div>
          )}

          {subTab === "approve" && (
            <div className="space-y-4">
              <Input
                label="Loan ID"
                value={cropId}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCropId(e.target.value)}
                icon={Package}
              />
              <Input
                label="Amount to Fund (ETH)"
                value={loanAmount}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLoanAmount(e.target.value)}
                icon={DollarSign}
              />
              <Button
                onClick={() =>
                  handleTransaction(async () => {
                    if (!credit) throw new Error("Credit contract not initialized");
                    const tx = await credit.approveLoan(Number(cropId), {
                      value: ethers.parseEther(loanAmount)
                    });
                    await tx.wait();
                  })
                }
                className="w-full mt-2 bg-purple-600 hover:bg-purple-700"
              >
                Fund Loan
              </Button>
            </div>
          )}

          {subTab === "repay" && (
            <div className="space-y-4">
              <Input
                label="Loan ID"
                value={cropId}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCropId(e.target.value)}
                icon={Package}
              />
              <Input
                label="Repayment Amount (ETH)"
                value={loanAmount}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLoanAmount(e.target.value)}
                icon={DollarSign}
              />
              <Button
                onClick={() =>
                  handleTransaction(async () => {
                    if (!credit) throw new Error("Credit contract not initialized");
                    const tx = await credit.repayLoan(Number(cropId), {
                      value: ethers.parseEther(loanAmount)
                    });
                    await tx.wait();
                  })
                }
                className="w-full mt-2 bg-purple-600 hover:bg-purple-700"
              >
                Repay Loan
              </Button>
            </div>
          )}
        </Card>
      </div>

      <div className="lg:col-span-2">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-800">Credit Ledger</h2>
        </div>
        <div className="space-y-3">
          {loans.map((l) => (
            <div
              key={l.id}
              className="bg-white rounded-lg border border-slate-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
                    l.active
                      ? "bg-purple-100 text-purple-600"
                      : "bg-slate-100 text-slate-400"
                  }`}
                >
                  <Landmark size={20} />
                </div>
                <div>
                  <h4 className="font-semibold text-white">Loan #{l.id}</h4>
                  <div className="flex gap-4 text-sm mt-1">
                    <span className="text-slate-500">
                      Principal: <span className="text-slate-800 font-medium">{l.amount} ETH</span>
                    </span>
                    <span className="text-slate-500">
                      Repaid: <span className="text-emerald-600 font-medium">{l.repaid} ETH</span>
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                  <p className="text-xs text-slate-500">Status</p>
                  <p className={`font-medium ${l.active ? "text-purple-600" : "text-slate-400"}`}>
                    {l.active ? "Active" : "Settled"}
                  </p>
                </div>
                {l.active && (
                  <Button
                    variant="ghost"
                    className="border border-slate-200 text-xs"
                    onClick={() => {
                      setSubTab("repay");
                      setCropId(l.id);
                    }}
                  >
                    Repay
                  </Button>
                )}
              </div>
            </div>
          ))}
          {loans.length === 0 && (
            <div className="py-12 text-center text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">
              <Landmark className="mx-auto mb-2 opacity-50" size={32} />
              No loan history
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-white pb-20">
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="bg-emerald-600 p-1.5 rounded-lg">
                <Sprout className="text-white" size={24} />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-700 to-teal-500">
                AgriTrade Hub
              </span>
            </div>

            <div className="flex items-center gap-4">
              {!account ? (
                <Button onClick={connectWallet} variant="primary" icon={Wallet}>
                  Connect Wallet
                </Button>
              ) : (
                <div className="flex items-center gap-3 bg-slate-100 rounded-full pl-4 pr-1 py-1 border border-slate-200">
                  <span className="text-xs font-mono text-slate-600">
                    {account.slice(0, 6)}...{account.slice(-4)}
                  </span>
                  <div className="h-8 w-8 bg-white rounded-full flex items-center justify-center shadow-sm text-emerald-600">
                    <Wallet size={16} />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-lg flex items-center gap-3">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Ecosystem Dashboard</h1>
          <p className="text-slate-500">
            Manage your agricultural assets, trade contracts, and access decentralized credit.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8 border-b border-slate-200">
          <div className="flex space-x-8">
            <button
              onClick={() => {
                setMainTab("auction");
                setSubTab("list");
              }}
              className={`pb-4 px-1 flex items-center gap-2 text-sm font-medium border-b-2 transition-colors ${
                mainTab === "auction"
                  ? "border-emerald-500 text-emerald-600"
                  : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
              }`}
            >
              <Gavel size={18} /> Auction House
            </button>
            <button
              onClick={() => {
                setMainTab("forward");
                setSubTab("create");
              }}
              className={`pb-4 px-1 flex items-center gap-2 text-sm font-medium border-b-2 transition-colors ${
                mainTab === "forward"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
              }`}
            >
              <Handshake size={18} /> Forward Trading
            </button>
            <button
              onClick={() => {
                setMainTab("credit");
                setSubTab("request");
              }}
              className={`pb-4 px-1 flex items-center gap-2 text-sm font-medium border-b-2 transition-colors ${
                mainTab === "credit"
                  ? "border-purple-500 text-purple-600"
                  : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
              }`}
            >
              <Landmark size={18} /> Credit System
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        {loading && (
          <div className="fixed inset-0 bg-white/50 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          </div>
        )}

        <div className="animate-in fade-in duration-500">
          {!account && (
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-8 text-center max-w-2xl mx-auto mt-10">
              <Wallet className="mx-auto text-emerald-400 mb-4" size={48} />
              <h3 className="text-xl font-semibold text-emerald-900 mb-2">Wallet Disconnected</h3>
              <p className="text-emerald-700 mb-6">
                Connect your Ethereum wallet to access the decentralized agriculture features.
              </p>
              <Button onClick={connectWallet}>Connect MetaMask</Button>
            </div>
          )}

          {account && mainTab === "auction" && renderAuction()}
          {account && mainTab === "forward" && renderForward()}
          {account && mainTab === "credit" && renderCredit()}
        </div>
      </main>
    </div>
  );
}