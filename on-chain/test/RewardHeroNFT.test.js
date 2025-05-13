const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("RewardHeroNFT", function () {
    let contract;
    let owner;
    let addr1;
    let addr2;
    let addr3;
    beforeEach(async function () {
        [owner, addr1, addr2, addr3] = await ethers.getSigners();
        const RewardHeroNFT = await ethers.getContractFactory("RewardHeroNFT");
        contract = await RewardHeroNFT.deploy();
        await contract.waitForDeployment();
    });

    describe("Initialisation", function () {
        it("Devrait avoir le bon nom et symbole", async function () {
            expect(await contract.name()).to.equal("Neon Verge: Heroes");
            expect(await contract.symbol()).to.equal("NEONHERO");
        });

        it("Devrait avoir minté le héros Genesis", async function () {
            expect(await contract.ownerOf(1)).to.equal(owner.address);
            expect(await contract.heroNames(1)).to.equal("Genesis");
            const stats = await contract.heroStats(1);
            expect(stats.rarity).to.equal(3); // LEGENDARY
        });
    });

    describe("Mint", function () {
        it("Devrait permettre le mint d'un héros commun", async function () {
            await contract.connect(addr1).mintCommonHero();
            expect(await contract.ownerOf(2)).to.equal(addr1.address);
            expect(await contract.heroNames(2)).to.equal("NV Hero");
            const stats = await contract.heroStats(2);
            expect(stats.rarity).to.equal(0); // COMMON
        });

        it("Devrait permettre le mint d'un héros personnalisé", async function () {
            await contract.connect(addr1).mintHero("Custom Hero", false);
            expect(await contract.ownerOf(2)).to.equal(addr1.address);
            expect(await contract.heroNames(2)).to.equal("Custom Hero");
        });

        it("Ne devrait pas permettre de mint plus d'un héros par adresse", async function () {
            await contract.connect(addr1).mintCommonHero();
            await expect(contract.connect(addr1).mintCommonHero())
                .to.be.revertedWith("You can only mint 1 heroes");
        });

        it("Ne devrait pas permettre de mint si le mint public est désactivé", async function () {
            await contract.setPublicMintActive(false);
            await expect(contract.connect(addr1).mintCommonHero())
                .to.be.revertedWith("Public mint is not active");
        });
    });

    describe("Gestion des noms", function () {
        beforeEach(async function () {
            await contract.connect(addr1).mintCommonHero();
        });

        it("Devrait permettre au propriétaire de changer le nom", async function () {
            await contract.connect(addr1).changeHeroName(2, "New Name");
            expect(await contract.heroNames(2)).to.equal("New Name");
        });

        it("Ne devrait pas permettre à un non-propriétaire de changer le nom", async function () {
            await expect(contract.connect(addr2).changeHeroName(2, "New Name"))
                .to.be.revertedWith("Not the owner of this hero");
        });

        it("Ne devrait pas permettre un nom vide", async function () {
            await expect(contract.connect(addr1).changeHeroName(2, ""))
                .to.be.revertedWith("Name cannot be empty");
        });

        it("Ne devrait pas permettre un nom trop long", async function () {
            const longName = "a".repeat(33);
            await expect(contract.connect(addr1).changeHeroName(2, longName))
                .to.be.revertedWith("Name too long");
        });
    });

    describe("Soulbound et transferts", function () {
        beforeEach(async function () {
            await contract.connect(addr1).mintCommonHero();
            await contract.setTransferWhitelist(addr2.address, true);
        });

        it("Devrait permettre au propriétaire de toggle soulbound", async function () {
            await contract.connect(owner).setSoulbound(2, true);
            const stats = await contract.heroStats(2);
            expect(stats.isNotsoulbound).to.equal(true);
        });

        it("Devrait permettre aux whitelistés de toggle soulbound", async function () {
            await contract.connect(addr2).setSoulbound(2, true);
            const stats = await contract.heroStats(2);
            expect(stats.isNotsoulbound).to.equal(true);
        });

        it("Ne devrait pas permettre aux non-whitelistés de toggle soulbound", async function () {
            await expect(contract.connect(addr3).setSoulbound(1, true))
                .to.be.revertedWith("Only owner or whitelisted contracts can toggle soulbound");
        });

        it("Devrait permettre le transfert quand soulbound est désactivé", async function () {
            await contract.setSoulbound(2, true);
            await contract.connect(addr1).transferFrom(addr1.address, addr2.address, 2);
            expect(await contract.ownerOf(2)).to.equal(addr2.address);
        });

        it("Ne devrait pas permettre le transfert quand soulbound est activé", async function () {
            await expect(contract.connect(addr1).transferFrom(addr1.address, addr2.address, 2))
                .to.be.revertedWith("Soulbound: transfer blocked");
        });
    });

    describe("Récupération d'informations", function () {
        beforeEach(async function () {
            await contract.connect(addr1).mintCommonHero();
        });

        it("Devrait retourner les bonnes informations avec getHeroInfo", async function () {
            const info = await contract.getHeroInfo(addr1.address, 0);
            const decoded = ethers.AbiCoder.defaultAbiCoder().decode(
                ['uint8', 'uint8', 'uint8', 'uint8', 'uint8', 'uint8', 'uint8', 'uint16', 'bool', 'string', 'uint8', 'uint256', 'address'],
                info
            );
            expect(decoded[9]).to.equal("NV Hero"); // nom
            expect(decoded[10]).to.equal(0); // rareté (COMMON)
        });

        it("Devrait retourner les bonnes informations avec getHeroInfoById", async function () {
            const info = await contract.getHeroInfoById(2, 0);
            const decoded = ethers.AbiCoder.defaultAbiCoder().decode(
                ['uint8', 'uint8', 'uint8', 'uint8', 'uint8', 'uint8', 'uint8', 'uint16', 'bool', 'string', 'uint8', 'uint256', 'address'],
                info
            );
            expect(decoded[9]).to.equal("NV Hero"); // nom
            expect(decoded[10]).to.equal(0); // rareté (COMMON)
        });
    });

    describe("Fonctions admin", function () {
        it("Devrait permettre au propriétaire de modifier les probabilités de rareté", async function () {
            await contract.setRarityProbabilities(50000, 30000, 15000, 5000);
            const probs = await contract.rarityProbs();
            expect(probs.common).to.equal(50000);
            expect(probs.rare).to.equal(30000);
            expect(probs.epic).to.equal(15000);
            expect(probs.legendary).to.equal(5000);
        });

        it("Ne devrait pas permettre aux non-propriétaires de modifier les probabilités", async function () {
            await expect(contract.connect(addr1).setRarityProbabilities(50000, 30000, 15000, 5000))
                .to.be.revertedWith("Only owner can set rarity probabilities");
        });

        it("Devrait permettre au propriétaire de modifier la whitelist", async function () {
            await contract.setTransferWhitelist(addr1.address, true);
            expect(await contract.transferWhitelist(addr1.address)).to.equal(true);
        });

        it("Ne devrait pas permettre aux non-propriétaires de modifier la whitelist", async function () {
            await expect(contract.connect(addr1).setTransferWhitelist(addr2.address, true))
                .to.be.revertedWith("Only owner can modify whitelist");
        });
    });
    describe("Transferts de héros", function () {
        it("doit transférer un héros de addr1 à addr2 et mettre à jour les stats", async function () {
            // Ajouter addr1 et addr2 à la whitelist
            await contract.connect(owner).setTransferWhitelist(addr1.address, true);
            await contract.connect(owner).setTransferWhitelist(addr2.address, true);
    
            // Mint un héros à addr1
            await contract.connect(addr1).mintCommonHero();
    
            // Le token minté automatiquement a l’ID 2 (Genesis = ID 1)
            const tokenId = 2;

            await contract.connect(owner).setSoulbound(tokenId, true);
    
            // Vérifie que addr1 possède bien le héros
            expect(await contract.ownerOf(tokenId)).to.equal(addr1.address);
    
            // Transfert de addr1 vers addr2
            await contract.connect(addr1).transferFrom(addr1.address, addr2.address, tokenId);
    
            // Vérifie que addr2 est maintenant propriétaire du token
            expect(await contract.ownerOf(tokenId)).to.equal(addr2.address);
    
            // Vérifie que heroStats a bien été mis à jour
            const stats = await contract.heroStats(tokenId);
            expect(stats.owner).to.equal(addr2.address);
        });
    });
    
      
}); 