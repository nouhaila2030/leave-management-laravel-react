import api from './utils/api';

// Test simple
const testAPI = async () => {
    try {
        console.log('Test de l\'API...');
        const response = await api.get('/test');
        console.log('✅ API fonctionne:', response.data);
    } catch (error) {
        console.error('❌ Erreur API:', error);
        console.error('URL:', error.config?.url);
        console.error('Status:', error.response?.status);
        console.error('Data:', error.response?.data);
    }
};

// Appelez cette fonction dans la console du navigateur
window.testAPI = testAPI;