// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract RewardHeroNFT is ERC721 {
//__________________________________________________________Enums__________________________________________________________
//__________________________________________________________Structs__________________________________________________________
    uint8 public constant COMMON = 0;
    uint8 public constant RARE = 1;
    uint8 public constant EPIC = 2;
    uint8 public constant LEGENDARY = 3;
    struct HeroStats {
        uint8 classId;
        uint16 imgId;
        uint8 rarity;
    }

    struct RarityProbabilities {
        uint256 common;
        uint256 rare;
        uint256 epic;
        uint256 legendary;
    }

    RarityProbabilities public rarityProbs = RarityProbabilities(70000, 25000, 4990, 10);


    mapping(uint256 => uint8[6]) public stats;
    mapping(uint256 => HeroStats) public heroStats;
    mapping(uint256 => string) public heroNames;
    mapping(uint256 => bool) public isTransferable;
    mapping(uint256 => bool) private isCommon;
    mapping(address => uint256) public ownerToTokenId;
    mapping(address => bool) public transferWhitelist;
    mapping(address => bool) private _hasMinted;
    bool public publicMintActive = true;

    uint256 public nextTokenId = 1;
    uint16 public nextUniqueimgId = 26;
    address private immutable _owner;
//__________________________________________________________Constructor__________________________________________________________
    constructor() ERC721 ("Neon Verge: Heroes", "NEONHERO"){
        _owner = msg.sender;
        transferWhitelist[msg.sender] = true;
        _safeMint(msg.sender, nextTokenId);
        heroStats[nextTokenId] = HeroStats(1, 25, LEGENDARY);
        stats[nextTokenId] = [20,20,20,20,20,20];
        heroNames[nextTokenId] = "Genesis";
        nextTokenId++;
    }
//__________________________________________________________Mint functions__________________________________________________________

    function transferForWhitelistedContract(uint256 tokenId, address to) external {
        require(transferWhitelist[to] || ownerOf(tokenId) == msg.sender, "Target contract not whitelisted");

        // transfert ERC721 classIdique
        _transfer(msg.sender, to, tokenId);

        // Supprime le lien actif joueur → token (pour autoriser un nouveau mint)
        ownerToTokenId[msg.sender] = 0;
    }
    
    function mintCommonHero() external returns (uint256) {
        require(publicMintActive, "Public mint is not active");
        require(!_hasMinted[msg.sender], "You can only mint 1 hero");
        require(balanceOf(msg.sender) <= 1, "You can only mint 1 hero");
        _hasMinted[msg.sender] = true;
        _safeMint(msg.sender, nextTokenId);
        generateRandomStats(nextTokenId, COMMON);
        heroNames[nextTokenId] = "NV Hero";
        uint256 currentTokenId = nextTokenId;
        isCommon[nextTokenId] = true;
        nextTokenId++;
        return currentTokenId;
    }


    function mintHero(string memory name, bool useNewImgId) external {
        require(publicMintActive, "Public mint is not active");
        require(balanceOf(msg.sender) <= 1, "You can only mint 1 hero");
        
        uint8 rarity = generateRandomRarity();
        _safeMint(msg.sender, nextTokenId);
        generateRandomStats(nextTokenId, rarity);
        
        if (useNewImgId) {
            heroStats[nextTokenId].imgId = nextUniqueimgId;
            nextUniqueimgId++;
        }
        heroNames[nextTokenId] = name;
        nextTokenId++;
    }

    function ownerMint(
        string memory name,
        uint8 classId,
        uint8 _STR,
        uint8 _DEX,
        uint8 _INT,
        uint8 _VIT,
        uint8 _CHA,
        uint8 _LCK,
        uint16 imgId,
        bool soulbound,
        uint8 rarity,
        bool randomRarity,
        bool manualImgId,
        address heroOwner
    ) external {
        require(msg.sender == _owner, "Only owner can mint special heroes");
        require(heroOwner != address(0), "Invalid hero owner address");
        
        if (!manualImgId) {
            imgId = nextUniqueimgId;
            nextUniqueimgId++;
        }

        _safeMint(heroOwner, nextTokenId);
        
        uint8 finalRarity = rarity;
        if (randomRarity) {
            finalRarity = generateRandomRarity();
        }
        
        heroStats[nextTokenId] = HeroStats(
            classId,
            imgId,
            finalRarity
        );
        stats[nextTokenId] = [_STR, _DEX, _INT, _VIT, _CHA, _LCK];
        isTransferable[nextTokenId] = soulbound;
        heroNames[nextTokenId] = name;
        nextTokenId++;
    }

    function generateRandomRarity() internal view returns (uint8) {
        uint256 rand = uint256(keccak256(abi.encodePacked(
            block.timestamp,
            block.prevrandao,
            msg.sender,
            gasleft()
        )));
        
        uint256 rarityRand = rand % 100000;
        if (rarityRand < rarityProbs.common) {
            return COMMON;
        } else if (rarityRand < rarityProbs.common + rarityProbs.rare) {
            return RARE;
        } else if (rarityRand < rarityProbs.common + rarityProbs.rare + rarityProbs.epic) {
            return EPIC;
        } else {
            return LEGENDARY;
        }
    }

    function generateRandomStats(uint256 tokenId, uint8 rarity) internal {
        uint256 rand = uint256(keccak256(abi.encodePacked(
            block.timestamp,
            block.prevrandao,
            msg.sender,
            gasleft()
        )));

        uint8 minStat;
        uint8 maxStat;

        if (rarity == RARE) {
            minStat = 3;
            maxStat = 12;
        } else if (rarity == EPIC) {
            minStat = 5;
            maxStat = 14;
        } else if (rarity == LEGENDARY) {
            minStat = 7;
            maxStat = 16;
        } else {
            minStat = 1;
            maxStat = 10;
        }

        uint8[6] memory baseStats;

        for (uint8 i = 0; i < 6; i++) {
            uint256 shifted = uint256(keccak256(abi.encode(rand, i)));
            baseStats[i] = uint8((shifted % (maxStat - minStat + 1)) + minStat);
        }
        uint8 class = uint8((rand >> 48) % 4);
        stats[tokenId] = baseStats;
        heroStats[tokenId].classId = class;
        heroStats[tokenId].rarity = rarity;
    }


    function getImgId(uint8 classIdId, uint8 statIndex) internal pure returns (uint16) {
        require(classIdId >= 1 && classIdId <= 4, "Invalid classId ID");
        require(statIndex >= 1 && statIndex <= 6, "Invalid stat index");

        if (classIdId == 1) {
            return statIndex;
        } else if (classIdId == 2) {
            return statIndex + 6;
        } else if (classIdId == 3) {
            return statIndex + 12;
        } else if (classIdId == 4) {
            return statIndex + 18;
        }
    }
//__________________________________________________________Get functions__________________________________________________________

    function getcompatibility(address _ownerverif, uint256 _tokenid) external pure returns (bool) {
        return true;
    }

    function getNextTokenId() external view returns (uint256) {
        return nextTokenId;
    }

    function getNextUniqueimgId() external view returns (uint16) {
        return nextUniqueimgId;
    }

    function getHeroStatsRaw(uint256 tokenId)
        external
        view
        returns (
            uint8 classId,
            uint8 stat0,
            uint8 stat1,
            uint8 stat2,
            uint8 stat3,
            uint8 stat4,
            uint8 stat5,
            uint16 imgId,
            bool transferable,
            uint8 rarity
        )
    {
        require(_exists(tokenId), "Invalid token");
        HeroStats memory h = heroStats[tokenId];
        uint8[6] memory tempstat = stats[tokenId];
        return (
            h.classId,
            tempstat[0], tempstat[1], tempstat[2], tempstat[3], tempstat[4],tempstat[5],
            h.imgId,
            isTransferable[tokenId],
            h.rarity
        );
    }


    function getHeroInfo(address owner, uint8 requestType) external view returns (bytes memory) {
        uint256 tokenId = ownerToTokenId[owner];
        require(tokenId != 0, "No hero found for this address");
        HeroStats memory hstats = heroStats[tokenId];
        uint8[6] memory stat = stats[tokenId];
        uint16 t_ID;
        if (isCommon[tokenId]){
            t_ID = computeImgId(hstats.classId, stat);
        }
        else {
            t_ID = hstats.imgId;
        }

        if (requestType == 0) { // Toutes les informations
            return abi.encode(
                hstats.classId,
                stat[0],
                stat[1],
                stat[2],
                stat[3],
                stat[4],
                stat[5],
                t_ID,
                isTransferable[tokenId],
                heroNames[tokenId],
                hstats.rarity,
                tokenId,
                owner
            );
        } else if (requestType == 1) { // classIde uniquement
            return abi.encode(hstats.classId);
        } else if (requestType == 2) { // Stats uniquement
            return abi.encode(stat[0], stat[1], stat[2], stat[3], stat[4], stat[5]);
        } else if (requestType == 3) { // Nom et rareté
            return abi.encode(heroNames[tokenId], hstats.rarity);
        } else if (requestType == 4) { // Image ID et soulbound status
            return abi.encode(hstats.imgId, isTransferable[tokenId]);
        } else if (requestType == 5) { // Propriétaire uniquement
            return abi.encode(owner);
        } else {
            revert("Invalid request type");
        }
    }

    function computeImgId(uint8 classIdId, uint8[6] memory mstats) internal pure returns (uint16) {
        uint8 maxIndex = 0;
        for (uint8 i = 1; i < 6; i++) {
            if (mstats[i] > mstats[maxIndex]) {
                maxIndex = i;
            }
        }
        return uint16(classIdId * 6 + maxIndex + 1); // imgId 1 à 24
    }


    function getHeroInfoById(uint256 tokenId, uint8 requestType) external view returns (bytes memory) {
        address owner = ownerOf(tokenId);
        require(tokenId != 0, "No hero found for this address");
        HeroStats memory hstats = heroStats[tokenId];
        uint8[6] memory stat = stats[tokenId];
        uint16 t_ID;
        if (isCommon[tokenId]){
            t_ID = computeImgId(hstats.classId, stat);
        }
        else {
            t_ID = hstats.imgId;
        }

        if (requestType == 0) { // Toutes les informations
            return abi.encode(
                hstats.classId,
                stat[0],
                stat[1],
                stat[2],
                stat[3],
                stat[4],
                stat[5],
                t_ID,
                isTransferable[tokenId],
                heroNames[tokenId],
                hstats.rarity,
                tokenId,
                owner
            );
        } else if (requestType == 1) { // classIde uniquement
            return abi.encode(hstats.classId);
        } else if (requestType == 2) { // Stats uniquement
            return abi.encode(stat[0], stat[1], stat[2], stat[3], stat[4], stat[5]);
        } else if (requestType == 3) { // Nom et rareté
            return abi.encode(heroNames[tokenId], hstats.rarity);
        } else if (requestType == 4) { // Image ID et soulbound status
            return abi.encode(hstats.imgId, isTransferable[tokenId]);
        } else if (requestType == 5) { // Propriétaire uniquement
            return abi.encode(owner);
        } else {
            revert("Invalid request type");
        }
    }
//__________________________________________________________Set functions__________________________________________________________

    function setPublicMintActive(bool active) external {
        require(msg.sender == _owner, "Only owner can toggle public mint");
        publicMintActive = active;
    }  
    
    function linkOwnerToTokenId(address owner, uint256 tokenId) external {
        require(msg.sender == _owner || transferWhitelist[msg.sender], "Only owner or whitelisted can link");
        require(owner != address(0), "Invalid owner address");
        require(tokenId > 0 && tokenId < nextTokenId, "Invalid token ID");
        require(ownerOf(tokenId) == owner, "Owner does not own this token");
        
        ownerToTokenId[owner] = tokenId;
    }

    function changeHeroName(uint256 tokenId, string memory newName) external {
        require(ownerOf(tokenId) == msg.sender, "Not the owner of this hero");
        require(heroStats[tokenId].rarity == COMMON, "Only common heroes can be renamed");
        require(bytes(newName).length > 0, "Name cannot be empty");
        require(bytes(newName).length <= 32, "Name too long");
        heroNames[tokenId] = newName;
    }

    function setHeroStats(
        uint256 tokenId,
        uint8 _STR,
        uint8 _DEX,
        uint8 _INT,
        uint8 _VIT,
        uint8 _CHA,
        uint8 _LCK
    ) external {
        require(transferWhitelist[msg.sender], "Only whitelisted addresses can modify stats");
        require(ownerOf(tokenId) != address(0), "Token does not exist");
        
        stats[tokenId] = [_STR, _DEX, _INT, _VIT, _CHA, _LCK];
    }

    function setSoulbound(uint256 tokenId, bool soulbound) external {
        require(msg.sender == _owner || transferWhitelist[msg.sender], "Only owner or whitelisted contracts can toggle soulbound");
        require(ownerOf(tokenId) != address(0), "Token does not exist");
        isTransferable[tokenId] = soulbound;
    }

    function setTransferWhitelist(address addr, bool status) external {
        require(msg.sender == _owner, "Only owner can modify whitelist");
        transferWhitelist[addr] = status;
    }

    function setRarityProbabilities(
        uint256 common,
        uint256 rare,
        uint256 epic,
        uint256 legendary
    ) external {
        require(msg.sender == _owner, "Only owner can set rarity probabilities");
        require(common + rare + epic + legendary == 100000, "Probabilities must sum to 100000");
        require(common > 0 && rare > 0 && epic > 0 && legendary > 0, "All probabilities must be greater than 0");
        
        rarityProbs = RarityProbabilities(common, rare, epic, legendary);
    }
//__________________________________________________________override functions_____________________________________________________

    function approve(address to, uint256 tokenId) public virtual override {
        require(isTransferable[tokenId], "Soulbound: approve blocked");
        super.approve(to, tokenId);
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 firstTokenId,
        uint256 batchSize
    ) internal virtual override {
        super._beforeTokenTransfer(from, to, firstTokenId, batchSize);
        
        if (from != address(0)) {
            require(isTransferable[firstTokenId], "Soulbound: approve blocked");
            ownerToTokenId[from] = 0;
        }
        if (to != address(0)) {
            if (msg.sender != address(this)) {
                require(transferWhitelist[to] || from == address(0), "Recipient not whitelisted");
            }
            ownerToTokenId[to] = firstTokenId;
        }
    }

    function setApprovalForAll(address _operator, bool _approved) public virtual override {
        revert("Soulbound: setApprovalForAll blocked");
    }

    function transferFrom(address from, address to, uint256 tokenId) public virtual override {
        require(isTransferable[tokenId], "Soulbound: transfer blocked");
        if (msg.sender != address(this)) {
            require(transferWhitelist[to] || from == address(0), "Recipient not whitelisted");
        }
        super.transferFrom(from, to, tokenId);
    }

    function safeTransferFrom(address from, address to, uint256 tokenId) public virtual override {
        safeTransferFrom(from, to, tokenId, "");
    }

    function safeTransferFrom(address from, address to, uint256 tokenId, bytes memory data) public virtual override {
        require(isTransferable[tokenId], "Soulbound: transfer blocked");
        if (msg.sender != address(this)) {
            require(transferWhitelist[to] || from == address(0), "Recipient not whitelisted");
        }
        super.safeTransferFrom(from, to, tokenId, data);
    }

    

    
}