const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Déploiement depuis :", deployer.address);

  const RewardHeroNFT = await hre.ethers.getContractFactory("RewardHeroNFT");
  const rewardHeroNFT = await RewardHeroNFT.deploy();
  await rewardHeroNFT.waitForDeployment();
  console.log("✅ Contrat rewardHeroNFT déployé à :", rewardHeroNFT.target);

  // Affichage des adresses pour référence
  console.log("\n📝 Résumé des adresses :");
  console.log("RewardHeroNFT:", rewardHeroNFT.target);
}

main().catch((error) => {
  console.error("❌ Erreur :", error);
  process.exitCode = 1;
});
