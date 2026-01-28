"use client";

import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, ABI } from "../lib/contract";

export default function Home() {
  const [account, setAccount] = useState("");
  const [contract, setContract] = useState(null);
  const [crops, setCrops] = useState([]);
  const [tab, setTab] = useState("farmer");

  const [cropId, setCropId] = useState("");
  const [bidAmount, setBidAmount] = useState("");

  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");

  async function connectWallet() {
    if (!window.ethereum) return alert("Install MetaMask");

    const provider = new ethers.BrowserProvider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = await provider.getSigner();

    const address = await signer.getAddress();
    setAccount(address);

    const contractInstance = new ethers.Contract(
      CONTRACT_ADDRESS,
      ABI,
      signer
    );

    setContract(contractInstance);
    fetchCrops(contractInstance);
  }

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", () => {
        connectWallet();
      });
    }
  }, []);

  async function fetchCrops(contractInstance = contract) {
    if (!contractInstance) return;

    const count = await contractInstance.cropCount();
    const items = [];

    for (let i = 1; i <= Number(count); i++) {
      const crop = await contractInstance.crops(i);
      const bid = await contractInstance.highestBids(i);

      items.push({
        id: crop[0].toString(),
        farmer: crop[1],
        name: crop[2],
        quantity: crop[3].toString(),
        basePrice: ethers.formatEther(crop[4]),
        active: crop[5],
        highestBid: ethers.formatEther(bid[1]),
        highestBidder: bid[0]
      });
    }

    setCrops(items);
  }

  async function listCrop() {
    if (!contract) return alert("Please connect your wallet first");
    try {
      const tx = await contract.listCrop(
        name,
        Number(quantity),
        ethers.parseEther(price)
      );
      await tx.wait();
      fetchCrops();
      alert("Crop listed successfully");
    } catch (err) {
      const error = err as any;
      if (error.code === "ACTION_REJECTED") {
        alert("Transaction cancelled by user ❌");
      } else {
        console.error(err);
        alert("Transaction failed ⚠️");
      }
    }
  }

  async function placeBid() {
    if (!contract) return alert("Please connect your wallet first");
    try {
      const tx = await contract.bid(Number(cropId), {
        value: ethers.parseEther(bidAmount)
      });
      await tx.wait();
      fetchCrops();
      alert("Bid placed successfully");
    } catch (err) {
      const error = err;

      // User rejected transaction
      if (error.code === "ACTION_REJECTED") {
        alert("Transaction cancelled by user ❌");
      }

      // Smart contract revert (low bid, auction ended, etc.)
      else if (
        error?.reason?.includes("Bid too low") ||
        error?.shortMessage?.includes("Bid too low")
      ) {
        alert("⚠️ Please increase your bid amount");
      }

      // Generic fallback
      else {
        console.error(err);
        alert("Transaction failed ⚠️");
      }
    }
  }



  async function endAuction() {
    if (!contract) return alert("Please connect your wallet first");

    try {
      const tx = await contract.endAuction(Number(cropId));
      await tx.wait();
      fetchCrops();
      alert("Auction ended successfully 🏁");
    } catch (err) {
      const error = err;

      // User rejected MetaMask transaction
      if (error.code === "ACTION_REJECTED") {
        alert("Transaction cancelled by user ❌");
      }

      // Smart contract revert: only farmer can end auction
      else if (
        error?.reason?.includes("Only farmer") ||
        error?.shortMessage?.includes("Only farmer")
      ) {
        alert("⚠️ Only the farmer who listed this crop can end the auction");
      }

      // Generic fallback
      else {
        console.error(err);
        alert("Transaction failed ⚠️");
      }
    }
  }


  return (
    <main className="min-h-screen bg-black p-6 flex flex-col items-center gap-6">
      <h1 className="text-3xl font-bold">🌾 Farmer Trade DApp</h1>

      {!account ? (
        <button
          onClick={connectWallet}
          className="px-6 py-2 bg-black text-white rounded"
        >
          Connect Wallet
        </button>
      ) : (
        <>
          <p className="text-sm">Connected: {account}</p>

          {/* Tabs */}
          <div className="flex gap-4">
            <button
              onClick={() => setTab("farmer")}
              className={`px-4 py-2 rounded ${tab === "farmer" ? "bg-green-600 text-white" : "bg-white border text-black"}`}
            >
              👨‍🌾 Farmer
            </button>
            <button
              onClick={() => setTab("buyer")}
              className={`px-4 py-2 rounded ${tab === "buyer" ? "bg-blue-600 text-white" : "bg-white border text-black"}`}
            >
              🧑‍💼 Buyer
            </button>
          </div>

          {/* Farmer Tab */}
          {tab === "farmer" && (
            <div className="w-full max-w-4xl grid md:grid-cols-2 gap-6">
              <div className="bg-white text-black p-5 rounded shadow">
                <h2 className="text-lg font-semibold mb-3">List Crop</h2>

                <input
                  placeholder="Crop Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border p-2 rounded mb-2"
                />

                <input
                  placeholder="Quantity (kg)"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full border p-2 rounded mb-2"
                />

                <input
                  placeholder="Base Price (ETH)"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full border p-2 rounded mb-3"
                />

                <button
                  onClick={listCrop}
                  className="w-full bg-green-600 text-white py-2 rounded"
                >
                  List Crop
                </button>
              </div>

              <div className="bg-white text-black p-5 rounded shadow">
                <h2 className="text-lg font-semibold mb-3">End Auction</h2>

                <input
                  placeholder="Crop ID"
                  value={cropId}
                  onChange={(e) => setCropId(e.target.value)}
                  className="w-full border p-2 rounded mb-3"
                />

                <button
                  onClick={endAuction}
                  className="w-full bg-red-600 text-white py-2 rounded"
                >
                  End Auction
                </button>
              </div>
            </div>
          )}

          {/* Buyer Tab */}
          {tab === "buyer" && (
            <div className="w-full max-w-4xl grid md:grid-cols-2 gap-6">
              <div className="bg-white text-black p-5 rounded shadow">
                <h2 className="text-lg font-semibold mb-3">Place Bid</h2>

                <input
                  placeholder="Crop ID"
                  value={cropId}
                  onChange={(e) => setCropId(e.target.value)}
                  className="w-full border p-2 rounded mb-2"
                />

                <input
                  placeholder="Bid Amount (ETH)"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  className="w-full border p-2 rounded mb-3"
                />

                <button
                  onClick={placeBid}
                  className="w-full bg-blue-600 text-white py-2 rounded"
                >
                  Place Bid
                </button>
              </div>
            </div>
          )}

          {/* Crop Display */}
          <div className="w-full max-w-7xl">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              📦 Live Crop Marketplace
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {crops.map((c) => (
                <div
                  key={c.id}
                  className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 p-5"
                >
                  {/* Header */}
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-semibold text-gray-800">
                      🌾 {c.name}
                    </h3>
                    <span className="text-xs font-bold px-2 py-1 rounded-full bg-gray-100">
                      ID #{c.id}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="space-y-1 text-sm text-gray-700">
                    <p>
                      <b>Quantity:</b> {c.quantity} kg
                    </p>
                    <p>
                      <b>Base Price:</b> {c.basePrice} ETH
                    </p>
                    <p>
                      <b>Highest Bid:</b>{" "}
                      <span className="font-semibold text-green-600">
                        {c.highestBid} ETH
                      </span>
                    </p>
                  </div>

                  {/* Status */}
                  <div className="mt-3">
                    <span
                      className={`text-xs font-semibold px-3 py-1 rounded-full ${c.active
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                        }`}
                    >
                      {c.active ? "Auction Live" : "Auction Ended"}
                    </span>
                  </div>

                  {/* Addresses */}
                  <div className="mt-4 border-t pt-3 space-y-1 text-xs text-gray-600">
                    <p className="break-all">
                      <b>Farmer:</b> {c.farmer}
                    </p>
                    <p className="break-all">
                      <b>Winner:</b>{" "}
                      {c.highestBidder === ethers.ZeroAddress
                        ? "No bids yet"
                        : c.highestBidder}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </>
      )
      }
    </main >
  );
}
