.PHONY: help build start stop restart logs status backup clean deploy

# Variables
COMPOSE_DEV = docker-compose
COMPOSE_PROD = docker-compose -f docker-compose.prod.yml
SCRIPT = ./scripts/deploy.sh

help: ## Afficher cette aide
	@echo "VitaFlow - Commandes disponibles:"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'
	@echo ""

build: ## Build des images Docker
	$(COMPOSE_DEV) build

start: ## Démarrer l'application (dev)
	@if [ ! -f .env ]; then \
		echo "Création du fichier .env..."; \
		cp .env.example .env; \
		echo "⚠️  Pensez à éditer .env avec vos valeurs"; \
	fi
	$(COMPOSE_DEV) up -d

seed: ## Créer le compte admin par défaut (admin@vitaflow.com / admin)
	@./scripts/seed-admin.sh

stop: ## Arrêter l'application
	$(COMPOSE_DEV) down

restart: stop start ## Redémarrer l'application

logs: ## Voir les logs
	$(COMPOSE_DEV) logs -f

logs-backend: ## Voir les logs du backend
	$(COMPOSE_DEV) logs -f backend

logs-frontend: ## Voir les logs du frontend
	$(COMPOSE_DEV) logs -f frontend

logs-mongodb: ## Voir les logs de MongoDB
	$(COMPOSE_DEV) logs -f mongodb

status: ## Voir l'état des conteneurs
	$(COMPOSE_DEV) ps
	@echo ""
	@docker stats --no-stream

backup: ## Sauvegarder la base de données
	@mkdir -p ./backups
	@TIMESTAMP=$$(date +%Y%m%d-%H%M%S); \
	echo "Sauvegarde en cours..."; \
	$(COMPOSE_DEV) exec -T mongodb mongodump \
		--username admin \
		--password vitaflow2024 \
		--authenticationDatabase admin \
		--db cabinet \
		--archive=./backups/backup-$$TIMESTAMP.gz \
		--gzip; \
	echo "✓ Sauvegarde créée: ./backups/backup-$$TIMESTAMP.gz"

clean: ## Nettoyer (⚠️  supprime tout)
	@echo "⚠️  Ceci va supprimer tous les conteneurs, images et volumes !"
	@read -p "Êtes-vous sûr ? (yes/no) " REPLY; \
	if [ "$$REPLY" = "yes" ]; then \
		$(COMPOSE_DEV) down -v --rmi all; \
		echo "✓ Nettoyage terminé"; \
	else \
		echo "Nettoyage annulé"; \
	fi

deploy-prep: ## Préparer le déploiement production
	@if [ ! -f .env ]; then \
		echo "Création du fichier .env pour production..."; \
		cp .env.prod.example .env; \
		echo "⚠️  IMPORTANT: Éditez .env et changez les mots de passe !"; \
	fi

deploy: deploy-prep ## Déployer en production
	$(COMPOSE_PROD) pull
	$(COMPOSE_PROD) up -d
	@echo "✓ Déploiement terminé"

deploy-seed: ## Créer le compte admin en production (admin@vitaflow.com / adminadmin)
	@./scripts/seed-admin-prod.sh

deploy-logs: ## Voir les logs (production)
	$(COMPOSE_PROD) logs -f

deploy-status: ## Voir l'état (production)
	$(COMPOSE_PROD) ps

deploy-stop: ## Arrêter (production)
	$(COMPOSE_PROD) down

test-backend: ## Tester le backend
	cd backend && npm test

test-frontend: ## Tester le frontend
	cd frontend && npm test

lint-backend: ## Linter le backend
	cd backend && npm run lint

lint-frontend: ## Linter le frontend
	cd frontend && npm run lint

install-backend: ## Installer les dépendances backend
	cd backend && npm install

install-frontend: ## Installer les dépendances frontend
	cd frontend && npm install

install: install-backend install-frontend ## Installer toutes les dépendances

dev-backend: ## Lancer le backend en mode dev (sans Docker)
	cd backend && npm run dev

dev-frontend: ## Lancer le frontend en mode dev (sans Docker)
	cd frontend && npm run dev

health: ## Vérifier la santé de l'application
	@echo "Vérification du backend..."
	@curl -s http://localhost:3001/api/health || echo "❌ Backend non accessible"
	@echo ""
	@echo "Vérification du frontend..."
	@curl -s -o /dev/null -w "Status: %{http_code}\n" http://localhost/ || echo "❌ Frontend non accessible"
