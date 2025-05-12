// Script simple pour générer des icônes de test
const fs = require('fs')
const { createCanvas } = require('canvas')

// Fonction pour générer une icône simple
function generateIcon(size, outputPath) {
	console.log(`Génération d'une icône ${size}x${size}...`)

	// Créer un canvas de la taille spécifiée
	const canvas = createCanvas(size, size)
	const ctx = canvas.getContext('2d')

	// Fond blanc
	ctx.fillStyle = '#ffffff'
	ctx.fillRect(0, 0, size, size)

	// Dessiner un cercle au centre
	ctx.fillStyle = '#4a90e2'
	ctx.beginPath()
	ctx.arc(size / 2, size / 2, size / 3, 0, Math.PI * 2)
	ctx.fill()

	// Ajouter un "N" au centre
	ctx.fillStyle = '#ffffff'
	ctx.font = `bold ${size / 2}px Arial`
	ctx.textAlign = 'center'
	ctx.textBaseline = 'middle'
	ctx.fillText('N', size / 2, size / 2)

	// Convertir en PNG et enregistrer
	const buffer = canvas.toBuffer('image/png')
	fs.writeFileSync(outputPath, buffer)
	console.log(`Icône enregistrée: ${outputPath}`)
}

// Générer les icônes requises
generateIcon(48, 'icon48.png')
generateIcon(96, 'icon96.png')

console.log('Génération des icônes terminée!')
