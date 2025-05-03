# RewardHeroNFT - Documentation du Contrat

Ce contrat gère la création et la gestion des héros NFT dans l'univers de Neon Verge.

## Constantes

- `COMMON = 0` : Valeur de rareté commune
- `RARE = 1` : Valeur de rareté rare
- `EPIC = 2` : Valeur de rareté épique
- `LEGENDARY = 3` : Valeur de rareté légendaire

## Structures

### HeroStats
Structure contenant les statistiques d'un héros :
- `class` (uint8) : Classe du héros (1-4)
- `_STR` (uint8) : Force
- `_DEX` (uint8) : Dextérité
- `_INT` (uint8) : Intelligence
- `_VIT` (uint8) : Vitalité
- `_CHA` (uint8) : Charisme
- `_LCK` (uint8) : Chance
- `imgId` (uint16) : ID de l'image
- `isNotsoulbound` (bool) : Statut de liaison
- `rarity` (uint8) : Rareté
- `tokenId` (uint256) : ID du token
- `owner` (address) : Propriétaire

### RarityProbabilities
Structure des probabilités de rareté :
- `common` (uint256) : Probabilité commune
- `rare` (uint256) : Probabilité rare
- `epic` (uint256) : Probabilité épique
- `legendary` (uint256) : Probabilité légendaire

## Fonctions Principales

### Minting

#### mintCommonHero()
- **Entrée** : Aucune
- **Retour** : Aucun
- **Utilité** : Permet de minter un héros commun gratuitement. Un seul héros par adresse.

#### mintHero(string memory name, bool useNewImgId)
- **Entrée** :
  - `name` : Nom du héros
  - `useNewImgId` : Utiliser un nouvel ID d'image
- **Retour** : Aucun
- **Utilité** : Minte un héros avec une rareté aléatoire. Le prix dépend de la rareté.

#### ownerMint(...)
- **Entrée** : Multiple paramètres pour personnaliser le héros
- **Retour** : Aucun
- **Utilité** : Fonction réservée au propriétaire pour minter des héros spéciaux

### Gestion des Héros

#### changeHeroName(uint256 tokenId, string memory newName)
- **Entrée** :
  - `tokenId` : ID du token
  - `newName` : Nouveau nom
- **Retour** : Aucun
- **Utilité** : Permet au propriétaire de changer le nom de son héros

#### modifyHeroStats(...)
- **Entrée** : `tokenId` et nouvelles statistiques
- **Retour** : Aucun
- **Utilité** : Modifie les statistiques d'un héros (réservé aux adresses whitelistées)

#### toggleSoulbound(uint256 tokenId)
- **Entrée** : `tokenId`
- **Retour** : Aucun
- **Utilité** : Active/désactive le statut soulbound d'un héros

### Informations

#### getHeroInfo(address owner, uint8 requestType)
- **Entrée** :
  - `owner` : Adresse du propriétaire
  - `requestType` : Type d'information demandée
- **Retour** : `bytes` - Données encodées
- **Utilité** : Récupère les informations d'un héros par propriétaire

#### getHeroInfoById(uint256 tokenId, uint8 requestType)
- **Entrée** :
  - `tokenId` : ID du token
  - `requestType` : Type d'information demandée
- **Retour** : `bytes` - Données encodées
- **Utilité** : Récupère les informations d'un héros par ID

### Gestion Administrative

#### setPublicMintActive(bool active)
- **Entrée** : `active` - État du minting public
- **Retour** : Aucun
- **Utilité** : Active/désactive le minting public

#### setRarityProbabilities(...)
- **Entrée** : Nouvelles probabilités pour chaque rareté
- **Retour** : Aucun
- **Utilité** : Modifie les probabilités de rareté

#### setTransferWhitelist(address addr, bool status)
- **Entrée** :
  - `addr` : Adresse à whitelister
  - `status` : État de la whitelist
- **Retour** : Aucun
- **Utilité** : Gère la whitelist des transferts

### Transferts

#### transferFrom(...)
- **Entrée** : `from`, `to`, `tokenId`
- **Retour** : Aucun
- **Utilité** : Transfert de token avec vérification soulbound

#### safeTransferFrom(...)
- **Entrée** : `from`, `to`, `tokenId`, `data` (optionnel)
- **Retour** : Aucun
- **Utilité** : Transfert sécurisé avec vérification soulbound

### Utilitaires

#### linkOwnerToTokenId(address owner, uint256 tokenId)
- **Entrée** :
  - `owner` : Adresse du propriétaire
  - `tokenId` : ID du token
- **Retour** : Aucun
- **Utilité** : Lie un propriétaire à un token ID

#### getImgId(uint8 classId, uint8 statIndex)
- **Entrée** :
  - `classId` : ID de la classe
  - `statIndex` : Index de la statistique
- **Retour** : `uint16` - ID de l'image
- **Utilité** : Calcule l'ID de l'image en fonction de la classe et de la statistique principale
