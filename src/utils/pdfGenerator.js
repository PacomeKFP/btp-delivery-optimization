import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export class PDFGenerator {
  constructor() {
    this.pdf = null;
    this.pageWidth = 210; // A4 width in mm
    this.pageHeight = 297; // A4 height in mm
    this.margin = 20;
    this.currentY = this.margin;
  }

  // Initialiser le PDF
  initializePDF() {
    this.pdf = new jsPDF('p', 'mm', 'a4');
    this.currentY = this.margin;
    
    // Configuration des polices
    this.pdf.setFont('helvetica');
  }

  // Ajouter le header avec logo et titre
  addHeader(title, subtitle = '', date = new Date()) {
    // Background header
    this.pdf.setFillColor(37, 99, 235); // Bleu primaire
    this.pdf.rect(0, 0, this.pageWidth, 40, 'F');
    
    // Titre principal
    this.pdf.setTextColor(255, 255, 255);
    this.pdf.setFontSize(22);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text(title, this.margin, 20);
    
    // Sous-titre
    if (subtitle) {
      this.pdf.setFontSize(14);
      this.pdf.setFont('helvetica', 'normal');
      this.pdf.text(subtitle, this.margin, 28);
    }
    
    // Date
    this.pdf.setFontSize(10);
    this.pdf.text(`Généré le ${date.toLocaleDateString('fr-FR')} à ${date.toLocaleTimeString('fr-FR')}`, 
                  this.pageWidth - this.margin - 40, 35);
    
    this.currentY = 50;
  }

  // Ajouter une section avec titre
  addSection(title, color = '#1f2937') {
    this.checkPageBreak(15);
    
    this.pdf.setTextColor(31, 41, 55); // Gris foncé
    this.pdf.setFontSize(16);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text(title, this.margin, this.currentY);
    
    // Ligne de soulignement
    this.pdf.setDrawColor(37, 99, 235);
    this.pdf.setLineWidth(0.5);
    this.pdf.line(this.margin, this.currentY + 2, this.pageWidth - this.margin, this.currentY + 2);
    
    this.currentY += 10;
  }

  // Ajouter du texte simple
  addText(text, fontSize = 11, isBold = false) {
    this.checkPageBreak(8);
    
    this.pdf.setTextColor(55, 65, 81);
    this.pdf.setFontSize(fontSize);
    this.pdf.setFont('helvetica', isBold ? 'bold' : 'normal');
    
    const lines = this.pdf.splitTextToSize(text, this.pageWidth - 2 * this.margin);
    this.pdf.text(lines, this.margin, this.currentY);
    this.currentY += lines.length * 5 + 3;
  }

  // Ajouter une liste à puces
  addBulletList(items, indent = 5) {
    items.forEach(item => {
      this.checkPageBreak(6);
      
      this.pdf.setTextColor(55, 65, 81);
      this.pdf.setFontSize(11);
      this.pdf.setFont('helvetica', 'normal');
      
      // Puce
      this.pdf.text('•', this.margin + indent, this.currentY);
      
      // Texte
      const lines = this.pdf.splitTextToSize(item, this.pageWidth - 2 * this.margin - 10);
      this.pdf.text(lines, this.margin + indent + 5, this.currentY);
      this.currentY += lines.length * 5;
    });
    this.currentY += 3;
  }

  // Ajouter un tableau
  addTable(headers, rows, columnWidths = null) {
    const tableWidth = this.pageWidth - 2 * this.margin;
    const numColumns = headers.length;
    const defaultColumnWidth = tableWidth / numColumns;
    const colWidths = columnWidths || new Array(numColumns).fill(defaultColumnWidth);
    
    this.checkPageBreak(20);
    
    // En-têtes
    this.pdf.setFillColor(239, 246, 255); // Bleu très clair
    this.pdf.setTextColor(37, 99, 235); // Bleu foncé
    this.pdf.setFontSize(10);
    this.pdf.setFont('helvetica', 'bold');
    
    let currentX = this.margin;
    headers.forEach((header, index) => {
      this.pdf.rect(currentX, this.currentY - 4, colWidths[index], 8, 'F');
      this.pdf.text(header, currentX + 2, this.currentY);
      currentX += colWidths[index];
    });
    
    this.currentY += 8;
    
    // Données
    this.pdf.setTextColor(55, 65, 81);
    this.pdf.setFont('helvetica', 'normal');
    
    rows.forEach((row, rowIndex) => {
      this.checkPageBreak(8);
      
      // Alternance des couleurs de lignes
      if (rowIndex % 2 === 1) {
        this.pdf.setFillColor(249, 250, 251);
        this.pdf.rect(this.margin, this.currentY - 4, tableWidth, 8, 'F');
      }
      
      currentX = this.margin;
      row.forEach((cell, colIndex) => {
        const text = this.pdf.splitTextToSize(String(cell), colWidths[colIndex] - 4);
        this.pdf.text(text, currentX + 2, this.currentY);
        currentX += colWidths[colIndex];
      });
      
      this.currentY += 8;
    });
    
    this.currentY += 5;
  }

  // Ajouter des métriques clés
  addKeyMetrics(metrics) {
    this.checkPageBreak(25);
    
    const metricWidth = (this.pageWidth - 2 * this.margin - 15) / 4;
    let currentX = this.margin;
    
    metrics.forEach((metric, index) => {
      // Fond coloré
      this.pdf.setFillColor(37, 99, 235);
      this.pdf.roundedRect(currentX, this.currentY, metricWidth, 20, 3, 3, 'F');
      
      // Valeur
      this.pdf.setTextColor(255, 255, 255);
      this.pdf.setFontSize(14);
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.text(metric.value, currentX + metricWidth/2, this.currentY + 8, { align: 'center' });
      
      // Label
      this.pdf.setFontSize(8);
      this.pdf.setFont('helvetica', 'normal');
      this.pdf.text(metric.label, currentX + metricWidth/2, this.currentY + 15, { align: 'center' });
      
      currentX += metricWidth + 5;
    });
    
    this.currentY += 30;
  }

  // Capturer un élément DOM et l'ajouter au PDF
  async addChartFromElement(elementId, width = 160, height = 100) {
    const element = document.getElementById(elementId);
    if (!element) {
      console.warn(`Élément ${elementId} non trouvé`);
      return;
    }

    try {
      const canvas = await html2canvas(element, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false
      });
      
      const imgData = canvas.toDataURL('image/png');
      
      this.checkPageBreak(height + 10);
      
      // Centrer l'image
      const x = (this.pageWidth - width) / 2;
      this.pdf.addImage(imgData, 'PNG', x, this.currentY, width, height);
      this.currentY += height + 10;
      
    } catch (error) {
      console.error('Erreur lors de la capture du graphique:', error);
      this.addText('Erreur lors de la génération du graphique', 10, false);
    }
  }

  // Ajouter une image depuis une URL
  async addImageFromUrl(imageUrl, width = 160, height = 100) {
    try {
      this.checkPageBreak(height + 10);
      
      const x = (this.pageWidth - width) / 2;
      this.pdf.addImage(imageUrl, 'PNG', x, this.currentY, width, height);
      this.currentY += height + 10;
      
    } catch (error) {
      console.error('Erreur lors du chargement de l\'image:', error);
      this.addText('Erreur lors du chargement de l\'image', 10, false);
    }
  }

  // Vérifier si on doit changer de page
  checkPageBreak(requiredHeight) {
    if (this.currentY + requiredHeight > this.pageHeight - this.margin) {
      this.pdf.addPage();
      this.currentY = this.margin;
    }
  }

  // Ajouter le footer
  addFooter() {
    const pageCount = this.pdf.internal.getNumberOfPages();
    
    for (let i = 1; i <= pageCount; i++) {
      this.pdf.setPage(i);
      
      // Ligne de séparation
      this.pdf.setDrawColor(229, 231, 235);
      this.pdf.setLineWidth(0.2);
      this.pdf.line(this.margin, this.pageHeight - 15, this.pageWidth - this.margin, this.pageHeight - 15);
      
      // Texte du footer
      this.pdf.setTextColor(107, 114, 128);
      this.pdf.setFontSize(8);
      this.pdf.setFont('helvetica', 'normal');
      
      // À gauche : informations de génération
      this.pdf.text('Simulateur Logistique BTP', this.margin, this.pageHeight - 8);
      
      // À droite : numéro de page
      this.pdf.text(`Page ${i} sur ${pageCount}`, this.pageWidth - this.margin - 20, this.pageHeight - 8);
    }
  }

  // Générer et télécharger le PDF
  async generateAndDownload(filename = 'rapport-simulation.pdf') {
    if (!this.pdf) {
      throw new Error('PDF non initialisé. Appelez initializePDF() d\'abord.');
    }
    
    this.addFooter();
    this.pdf.save(filename);
  }

  // Obtenir le blob du PDF
  getBlob() {
    if (!this.pdf) {
      throw new Error('PDF non initialisé. Appelez initializePDF() d\'abord.');
    }
    
    this.addFooter();
    return this.pdf.output('blob');
  }
}

// Fonction utilitaire pour générer un rapport complet
export async function generateSimulationReport(simulationData) {
  const generator = new PDFGenerator();
  generator.initializePDF();
  
  // Page de couverture
  generator.addHeader(
    'RAPPORT DE SIMULATION LOGISTIQUE',
    'Système d\'optimisation d\'approvisionnement BTP',
    new Date()
  );
  
  // Résumé exécutif
  generator.addSection('RÉSUMÉ EXÉCUTIF');
  
  const keyMetrics = [
    { value: `${simulationData.demand} m³`, label: 'Demande' },
    { value: `${simulationData.selectedSolution.satisfactionRate.toFixed(1)}%`, label: 'Satisfaction' },
    { value: `${simulationData.selectedSolution.combination.length}`, label: 'Fournisseurs' },
    { value: `${Math.round(simulationData.selectedSolution.maxDeliveryTime)} min`, label: 'Temps max \n (Tout fournisseurs confondus)' }
  ];
  
  generator.addKeyMetrics(keyMetrics);
  
  const formatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "XAF",
  minimumFractionDigits: 0,
});
  // Informations du projet
  generator.addText(`Matériau demandé : ${simulationData.materialType}`, 11, true);
  generator.addText(`Date de livraison souhaitée : ${simulationData.deliveryDate}`, 11, false);
  generator.addText(`Heure d'arrivée souhaitée : ${simulationData.arrivalTime}`, 11, false);
  generator.addText(`Coût total estimé : ${formatter.format(simulationData.selectedSolution.totalCost)}`, 11, true);
  
  // Analyse des fournisseurs
  generator.addSection('FOURNISSEURS SÉLECTIONNÉS');
  
  const supplierHeaders = ['Fournisseur', 'Quantité', 'Distance', 'Temps', 'Coût'];
  const supplierRows = simulationData.selectedSolution.combination.map(supplier => [
    supplier.name,
    `${supplier.allocatedQuantity} m³`,
    `${supplier.timeData.distance} km`,
    `${Math.round(supplier.timeData.averageTime)} min`,
    `${new Intl.NumberFormat('fr-FR').format(supplier.allocatedQuantity * supplier.costPerM3)} FCFA`
  ]);
  
  generator.addTable(supplierHeaders, supplierRows, [40, 25, 25, 25, 35]);
  
  // Détails logistiques
  generator.addSection('PLANNING LOGISTIQUE');
  
  const deliveries = simulationData.selectedSolution.deliveries;
  generator.addText('Planification des livraisons :', 12, true);
  
  const logisticsData = deliveries.map(delivery => 
    `• ${delivery.supplierName}: Départ à ${delivery.optimalDeparture.departureHour}h, ${delivery.numDeliveries} livraison(s) (${delivery.trucks10Count || 0}×10m³ + ${delivery.trucks8Count || 0}×8m³)`
  );
  
  generator.addBulletList(logisticsData);
  
  // Recommandations
  generator.addSection('RECOMMANDATIONS');
  
  if (simulationData.selectedSolution.recommendations.length > 0) {
    generator.addBulletList(simulationData.selectedSolution.recommendations);
  } else {
    generator.addText('Aucune recommandation particulière. La solution proposée respecte tous les critères optimaux.');
  }
  
  // Méthodologie
  generator.addSection('MÉTHODOLOGIE');
  
  generator.addText('Cette simulation utilise :', 11, true);
  generator.addBulletList([
    'Méthode AHP (Analytic Hierarchy Process) pour l\'évaluation multicritère des fournisseurs',
    'Chaînes de Markov pour la modélisation stochastique des temps de transport',
    'API OSRM pour le calcul des routes réelles et distances précises',
    'Optimisation combinatoire pour la sélection optimale des fournisseurs',
    'Logique de camions toupies 10m³ et 8m³ pour les calculs de livraison'
  ]);
  
  return generator;
}