import http from '../../shared/services/base.service';
import { NewsResponse } from '../model/news.response';

export class NewsService {
    endpoint = '/news';

    getAllNews() {
        return http.get(this.endpoint);
    }

    //Testing
    //Methods for testing purposes
    async getAllNewsTest() : Promise<NewsResponse[]> {
        const newsData : NewsResponse[] = [
            new NewsResponse(1, "News Title 1", "Content of news 1", new Date('2024-01-01'), 
            [
                "https://global.tiffin.edu/img/article/consejos-para-encontrar-trabajo-despues-de-egresar.webp",
                "https://static.mercadonegro.pe/wp-content/uploads/2024/02/13123541/trabajo-peruanos-pasion.jpg",
                "https://pqs.pe/wp-content/uploads/2021/10/PQS-transicion-laboral-800x533.jpeg"
            ]),
            new NewsResponse(2, "News Title 2", "Content of news 2", new Date('2024-02-01'), ["https://www.robertwalters.mx/tendencias-de-talento/consejos-de-carrera/blog/como-realizar-entrevista-de-trabajo-exitosa/_jcr_content/root/responsivegrid/article-detail/image.coreimg.85.1024.jpeg/1695935940570/cadres-932x530--2-.jpeg"]),
            new NewsResponse(3, "News Title 3", "Content of news 3", new Date('2024-03-01'))
        ];

        return newsData;
    }
}