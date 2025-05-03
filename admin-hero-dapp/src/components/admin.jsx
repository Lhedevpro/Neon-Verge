import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import RewardHeroNFT from '../contracts/RewardHeroNFT.json';
import { getContract } from '../connect';
import './admin.css';

const CONTRACT_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

function HeroNFT() {
    const [account, setAccount] = useState('');
    const [hasHero, setHasHero] = useState(false);
    const [heroStats, setHeroStats] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [heroName, setHeroName] = useState('');
    const [addressToWhitelist, setAddressToWhitelist] = useState("");
    const [common, setCommon] = useState(70000);
    const [rare, setRare] = useState(25000);
    const [epic, setEpic] = useState(4990);
    const [legendary, setLegendary] = useState(10);
    const [publicMintActive, setPublicMintActive] = useState(false);
    const [soulboundValue, setSoulboundValue] = useState(false);
    const [tokenId, setTokenId] = useState(1);
    const [contract, setContract] = useState(null);


    const switchToLocalNetwork = async () => {
        try {
            await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [{
                    chainId: '0x7a69',
                    chainName: 'Hardhat Local',
                    nativeCurrency: {
                        name: 'ETH',
                        symbol: 'ETH',
                        decimals: 18
                    },
                    rpcUrls: ['http://127.0.0.1:8545']
                }]
            });
        } catch (error) {
            console.error("Error switching network:", error);
            throw error;
        }
    };

    const checkNetwork = async () => {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const network = await provider.getNetwork();
        if (network.chainId !== 31337n) {
            await switchToLocalNetwork();
        }
    };
    async function toggleMintStatus() {
        if (!contract) return;
        try {
          const tx = await contract.togglePublicMint();
          await tx.wait();
          const updatedStatus = await contract.publicMintActive();
          setPublicMintActive(updatedStatus);
          alert("Statut du mint mis à jour !");
        } catch (err) {
          console.error(err);
          alert("Erreur lors du changement de statut du mint.");
        }
      }
      
      async function toggleSoulbound() {
        if (!contract || tokenId === "") return;
        try {
          const tx = await contract.setSoulbound(tokenId, soulboundValue);
          await tx.wait();
          alert("Soulbound mis à jour !");
        } catch (err) {
          console.error(err);
          alert("Erreur lors de la modification du soulbound.");
        }
      }
      
      async function updateWhitelist() {
        if (!contract || !addressToWhitelist) return;
        try {
          const tx = await contract.setTransferWhitelist(addressToWhitelist, true);
          await tx.wait();
          alert("Adresse whitelistée !");
        } catch (err) {
          console.error(err);
          alert("Erreur lors de la mise à jour de la whitelist.");
        }
      }
      
      async function updateRarity() {
        if (!contract) return;
        try {
          const tx = await contract.setRarityProbabilities(
            Number(common),
            Number(rare),
            Number(epic),
            Number(legendary)
          );
          await tx.wait();
          alert("Probabilités de rareté mises à jour !");
        } catch (err) {
          console.error(err);
          alert("Erreur lors de la mise à jour des probabilités.");
        }
      }
      

    const connectWallet = async () => {
        try {
            if (!window.ethereum) {
                throw new Error("Please install Metamask");
            }

            await checkNetwork();

            const accounts = await window.ethereum.request({ 
                method: 'eth_requestAccounts' 
            });
            
            if (accounts.length === 0) {
                throw new Error("No account found");
            }

            console.log("Connected account:", accounts[0]);
            setAccount(accounts[0]);
            checkHeroOwnership(accounts[0]);

            window.ethereum.on('accountsChanged', (newAccounts) => {
                console.log("Account changed:", newAccounts);
                if (newAccounts.length === 0) {
                    setAccount('');
                    setHasHero(false);
                    setHeroStats(null);
                } else {
                    setAccount(newAccounts[0]);
                    checkHeroOwnership(newAccounts[0]);
                }
            });

            window.ethereum.on('chainChanged', (chainId) => {
                console.log("Network changed:", chainId);
                window.location.reload();
            });

        } catch (err) {
            console.error("Connection error:", err);
            setError(err.message);
        }
    };

    const checkHeroOwnership = async (userAddress) => {
        try {
            const contract = await getContract();
            const tokenId = await contract.ownerToTokenId(userAddress);
            console.log("Token ID found:", tokenId.toString());
            
            if (tokenId > 0) {
                setHasHero(true);
                fetchHeroStats(tokenId);
            } else {
                setHasHero(false);
                setHeroStats(null);
            }
        } catch (err) {
            console.error("Error checking hero ownership:", err);
            setError(err.message);
        }
    };

    const fetchHeroStats = async (tokenId) => {
        try {
            const contract = await getContract();
            const info = await contract.getHeroInfoById(tokenId, 0);
            const name = await contract.heroNames(tokenId);
            setHeroName(name);
            
            // Décodage des données retournées par getHeroInfo
            const decoded = ethers.AbiCoder.defaultAbiCoder().decode(
                ['uint8', 'uint8', 'uint8', 'uint8', 'uint8', 'uint8', 'uint8', 'uint16', 'bool', 'string', 'uint8', 'uint256', 'address'],
                info
            );
            
            setHeroStats({
                class: decoded[0],
                STR: decoded[1],
                DEX: decoded[2],
                INT: decoded[3],
                VIT: decoded[4],
                CHA: decoded[5],
                LCK: decoded[6],
                imgId: decoded[7],
                isNotsoulbound: decoded[8],
                rarity: decoded[10]
            });
        } catch (err) {
            console.error("Error fetching hero stats:", err);
            setError(err.message);
        }
    };

    const mintHero = async () => {
        try {
            setLoading(true);
            const contract = await getContract();
            const tx = await contract.mintCommonHero();
            const receipt = await tx.wait();
            
            // Le lien est fait automatiquement dans _beforeTokenTransfer
            checkHeroOwnership(account);
        } catch (err) {
            console.error("Error minting:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const getClass = (classId) => {
        console.log("Class value:", classId, "Type:", typeof classId);
        const classNum = Number(classId);
        console.log("Converted value:", classNum);
        
        switch(classNum) {
            case 1:
                return "Net Runner";
            case 2:
                return "Street Brawler";
            case 3:
                return "Slicer";
            case 4:
                return "Tech Nomad";
            default:
                return `Unknown class (${classNum})`;
        }
    };

    const changeHeroName = async (newName) => {
        try {
            const contract = await getContract();
            const tokenId = await contract.ownerToTokenId(account);
            const tx = await contract.changeHeroName(tokenId, newName);
            await tx.wait();
            setHeroName(newName);
        } catch (err) {
            console.error("Error changing hero name:", err);
            setError(err.message);
        }
    };

    return (
              <div className="app-container">
                <div
                  className="background"
                  style={{ backgroundImage: "url('/imgs/Fond.png')" }}
                ></div>
          
                {!account ? (
                  <button onClick={connectWallet} className="explore-btn">
                    Connect Metamask
                  </button>
                ) : (
                  <div className="admin-panel">
                    <h1 className="text-2xl font-bold text-white mb-4">Neon Verge - Admin Control Panel</h1>
          
                    <div className="control-section">
                      <h2>Mint Control</h2>
                      <p>Status: {!publicMintActive ? "✅ Enabled" : "❌ Disabled"}</p>
                      <button onClick={toggleMintStatus} className="explore-btn">
                        {publicMintActive ? "Disable Mint" : "Enable Mint"}
                      </button>
                    </div>
          
                    <div className="control-section">
                      <h2>Mint Hero (Admin)</h2>
                      <button onClick={mintHero} disabled={loading} className="explore-btn">
                        {loading ? "Minting..." : "Mint Admin Hero"}
                      </button>
                    </div>
          
                    <div className="control-section">
                      <h2>Soulbound Control</h2>
                      <input
                        type="number"
                        placeholder="Token ID"
                        value={tokenId}
                        onChange={(e) => setTokenId(e.target.value)}
                        className="input"
                      />
                      <select
                        value={soulboundValue}
                        onChange={(e) => setSoulboundValue(e.target.value === "true")}
                        className="input"
                      >
                        <option value="true">Non-soulbound</option>
                        <option value="false">Soulbound</option>
                      </select>
                      <button onClick={toggleSoulbound} className="explore-btn">
                        Update Soulbound
                      </button>
                    </div>
          
                    <div className="footer-border"></div>
                  </div>
                )}
              </div>
            );
}

export default HeroNFT; 