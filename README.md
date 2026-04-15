# Dépôt d'Add-ons Home Assistant

Bienvenue dans mon dépôt personnel d'add-ons Home Assistant ! Ce repository contient des add-ons personnalisés pour étendre les fonctionnalités de Home Assistant.

## Add-ons

| Add-on | Description | Lien |
|--------|-------------|------|
| [iPod Thermostat](ipod-thermostat/) | Interface web compacte pour piloter un thermostat Home Assistant depuis un mobile | [Détails](ipod-thermostat/README.md) |

## Installation

Pour ajouter ce dépôt à votre installation Home Assistant :

1. Dans l'interface Home Assistant, allez dans **Paramètres** > **Add-ons** > **Add-on Store**
2. Cliquez sur les **...** en haut à droite et sélectionnez **Dépôts**
3. Ajoutez l'URL de ce dépôt : `https://github.com/aymericdo/ipod-thermostat`
4. Les add-ons apparaîtront dans le store et pourront être installés

## Structure du dépôt

Ce dépôt suit le format standard des dépôts d'add-ons Home Assistant :
- `repository.yaml` : Définition du dépôt
- Chaque add-on dans son propre dossier avec :
  - `config.yaml` : Configuration de l'add-on
  - `Dockerfile` : Image Docker
  - Code source de l'application

## À propos

Ce dépôt est organisé pour faciliter la distribution et l'installation d'add-ons personnalisés sur Home Assistant.

## Contact

- **Auteur** : [aymericdo](https://github.com/aymericdo)