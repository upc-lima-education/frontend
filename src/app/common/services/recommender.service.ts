import axios from "axios";

const RECOMMENDER_BASE_URL = import.meta.env.VITE_RECOMMENDER_API_URL || "https://ca-llanqui-recommendation.wittytree-b712258b.centralus.azurecontainerapps.io/api/v1";

const httpRecommender = axios.create({
    baseURL: RECOMMENDER_BASE_URL,
    headers: { 'Content-Type': 'application/json' }
});

export default httpRecommender;
