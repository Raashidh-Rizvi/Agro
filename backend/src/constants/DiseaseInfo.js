/**
 * Comprehensive disease database for Agro AI diagnostics.
 * This file contains detailed information about causes, symptoms, treatments, and prevention
 * for various crop diseases.
 */

const DISEASE_INFO = {
  "Apple___Apple_scab": {
    "crop": "Apple",
    "cause": "Fungus (Venturia inaequalis), spreads in wet and humid conditions",
    "symptoms": [
      "Dark olive-green spots on leaves",
      "Leaves become yellow and fall early",
      "Black lesions on fruit"
    ],
    "treatment": [
      "Apply fungicides like Mancozeb or Captan",
      "Remove and destroy infected leaves",
      "Prune trees to improve airflow"
    ],
    "prevention": [
      "Avoid overhead watering",
      "Plant resistant varieties",
      "Keep orchard clean from fallen leaves"
    ]
  },

  "Apple___Black_rot": {
    "crop": "Apple",
    "cause": "Fungus (Botryosphaeria obtusa)",
    "symptoms": [
      "Purple spots on leaves",
      "Rotting fruit with black rings",
      "Cankers on branches"
    ],
    "treatment": [
      "Remove infected fruits and branches",
      "Apply fungicides regularly",
      "Prune affected areas"
    ],
    "prevention": [
      "Maintain tree hygiene",
      "Avoid injuries to trees",
      "Ensure good air circulation"
    ]
  },

  "Apple___Cedar_apple_rust": {
    "crop": "Apple",
    "cause": "Fungus (Gymnosporangium juniperi-virginianae)",
    "symptoms": [
      "Bright orange spots on leaves",
      "Spots enlarge over time",
      "Fruit deformation"
    ],
    "treatment": [
      "Apply sulfur-based fungicides",
      "Remove nearby juniper plants if possible"
    ],
    "prevention": [
      "Plant resistant apple varieties",
      "Avoid planting near cedar/juniper trees"
    ]
  },

  "Corn_(maize)___Common_rust_": {
    "crop": "Maize",
    "cause": "Fungus (Puccinia sorghi)",
    "symptoms": [
      "Small reddish-brown pustules on leaves",
      "Leaf drying in severe cases"
    ],
    "treatment": [
      "Apply fungicides like Propiconazole",
      "Remove infected leaves"
    ],
    "prevention": [
      "Use resistant maize varieties",
      "Proper spacing between plants"
    ]
  },

  "Corn_(maize)___Northern_Leaf_Blight": {
    "crop": "Maize",
    "cause": "Fungus (Exserohilum turcicum)",
    "symptoms": [
      "Long gray-green lesions",
      "Leaves dry from tips"
    ],
    "treatment": [
      "Use fungicides",
      "Remove infected plants"
    ],
    "prevention": [
      "Crop rotation",
      "Use resistant seeds"
    ]
  },

  "Pepper__bell___Bacterial_spot": {
    "crop": "Bell Pepper",
    "cause": "Bacteria (Xanthomonas campestris)",
    "symptoms": [
      "Water-soaked spots on leaves",
      "Spots turn brown and dry",
      "Leaf drop"
    ],
    "treatment": [
      "Use copper-based bactericides",
      "Remove infected plants"
    ],
    "prevention": [
      "Use disease-free seeds",
      "Avoid working with wet plants"
    ]
  },

  "Potato___Early_blight": {
    "crop": "Potato",
    "cause": "Fungus (Alternaria solani)",
    "symptoms": [
      "Dark spots with concentric rings",
      "Yellowing around spots"
    ],
    "treatment": [
      "Apply fungicides like Chlorothalonil",
      "Remove infected leaves"
    ],
    "prevention": [
      "Crop rotation",
      "Avoid water stress"
    ]
  },

  "Potato___Late_blight": {
    "crop": "Potato",
    "cause": "Fungus (Phytophthora infestans)",
    "symptoms": [
      "Dark wet spots on leaves",
      "White mold under leaves",
      "Rapid plant death"
    ],
    "treatment": [
      "Apply fungicides immediately",
      "Remove infected plants"
    ],
    "prevention": [
      "Avoid high humidity",
      "Proper spacing",
      "Use resistant varieties"
    ]
  },

  "Tomato_Bacterial_spot": {
    "crop": "Tomato",
    "cause": "Bacteria (Xanthomonas spp.)",
    "symptoms": [
      "Small dark spots on leaves",
      "Spots on fruits",
      "Leaf drop"
    ],
    "treatment": [
      "Apply copper sprays",
      "Remove infected plants"
    ],
    "prevention": [
      "Use certified seeds",
      "Avoid overhead irrigation"
    ]
  },

  "Tomato_Early_blight": {
    "crop": "Tomato",
    "cause": "Fungus (Alternaria solani)",
    "symptoms": [
      "Target-like spots",
      "Yellowing leaves",
      "Lower leaves affected first"
    ],
    "treatment": [
      "Apply fungicides",
      "Remove infected leaves"
    ],
    "prevention": [
      "Crop rotation",
      "Proper plant spacing"
    ]
  },

  "Tomato_Late_blight": {
    "crop": "Tomato",
    "cause": "Fungus (Phytophthora infestans)",
    "symptoms": [
      "Dark lesions on leaves",
      "Rapid spread in wet conditions"
    ],
    "treatment": [
      "Apply fungicides quickly",
      "Destroy infected plants"
    ],
    "prevention": [
      "Avoid wet leaves",
      "Good airflow"
    ]
  },

  "Tomato_Leaf_Mold": {
    "crop": "Tomato",
    "cause": "Fungus (Passalora fulva)",
    "symptoms": [
      "Yellow spots on upper leaf",
      "Mold on underside"
    ],
    "treatment": [
      "Use fungicides",
      "Improve ventilation"
    ],
    "prevention": [
      "Reduce humidity",
      "Avoid overcrowding"
    ]
  },

  "Tomato_Septoria_leaf_spot": {
    "crop": "Tomato",
    "cause": "Fungus (Septoria lycopersici)",
    "symptoms": [
      "Small circular spots",
      "Yellow halos"
    ],
    "treatment": [
      "Apply fungicides",
      "Remove affected leaves"
    ],
    "prevention": [
      "Avoid wet leaves",
      "Crop rotation"
    ]
  },

  "Tomato_Spider_mites_Two_spotted_spider_mite": {
    "crop": "Tomato",
    "cause": "Pest (Spider mites)",
    "symptoms": [
      "Yellow speckles",
      "Webbing under leaves"
    ],
    "treatment": [
      "Use insecticides or neem oil",
      "Wash leaves with water"
    ],
    "prevention": [
      "Maintain humidity",
      "Monitor regularly"
    ]
  },

  "Tomato__Tomato_YellowLeaf__Curl_Virus": {
    "crop": "Tomato",
    "cause": "Virus spread by whiteflies",
    "symptoms": [
      "Yellow curled leaves",
      "Stunted growth"
    ],
    "treatment": [
      "No cure – remove infected plants",
      "Control whiteflies"
    ],
    "prevention": [
      "Use insect nets",
      "Resistant varieties"
    ]
  },

  "Tomato__Tomato_mosaic_virus": {
    "crop": "Tomato",
    "cause": "Virus (TMV)",
    "symptoms": [
      "Mosaic pattern on leaves",
      "Distorted growth"
    ],
    "treatment": [
      "Remove infected plants"
    ],
    "prevention": [
      "Disinfect tools",
      "Avoid handling plants after tobacco use"
    ]
  }
};

/**
 * Get disease details by name with flexible matching.
 * @param {string} diseaseName 
 * @returns {object|null}
 */
const getDiseaseDetails = (diseaseName) => {
    // 1. Direct match
    if (DISEASE_INFO[diseaseName]) {
        return DISEASE_INFO[diseaseName];
    }

    // 2. Normalized match (remove underscores and case insensitive)
    const normalizedTarget = diseaseName.toLowerCase().replace(/_/g, '').replace(/\s/g, '');
    for (const key in DISEASE_INFO) {
        const normalizedKey = key.toLowerCase().replace(/_/g, '').replace(/\s/g, '');
        if (normalizedKey === normalizedTarget) {
            return DISEASE_INFO[key];
        }
    }

    // 3. Fallback: Search for partial match (if "Tomato Late Blight" is passed and "Tomato_Late_blight" exists)
    for (const key in DISEASE_INFO) {
        if (diseaseName.includes(key) || key.includes(diseaseName)) {
            return DISEASE_INFO[key];
        }
    }

    return null;
};

module.exports = {
    DISEASE_INFO,
    getDiseaseDetails
};
