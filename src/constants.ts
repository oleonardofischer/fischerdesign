export interface Project {
  id: string;
  title: string;
  category: string;
  description: string;
  detailedDescription?: string;
  imageUrl: string;
  year: string;
  gallery?: string[];
}

export const PROJECTS: Project[] = [
  {
    id: "gmv",
    title: "GMV ID Visual",
    category: "Identidade Visual",
    description: "Sistema visual para a GMV Festas e Eventos de Chapecó, Santa Catarina.",
    imageUrl: "https://mir-s3-cdn-cf.behance.net/project_modules/max_1200/73ce49194232473.65f8f91a29fe6.jpg",
    year: "2025",
    gallery: [
      "https://mir-s3-cdn-cf.behance.net/project_modules/max_1200/73ce49194232473.65f8f91a29fe6.jpg"
    ]
  },
  {
    id: "rodomavi",
    title: "Conteúdo Digital",
    category: "redes-sociais",
    description: "Conteúdos de alto impacto para divulgação e presença digital.",
    imageUrl: "https://mir-s3-cdn-cf.behance.net/project_modules/max_1200/2318cc198515621.6642c01e9d99f.png",
    year: "2026",
    gallery: ["https://mir-s3-cdn-cf.behance.net/project_modules/hd_webp/a964a6198515621.6642c270885ae.png", "https://mir-s3-cdn-cf.behance.net/project_modules/disp/c6266e198515621.6642c27087d42.png", "https://mir-s3-cdn-cf.behance.net/project_modules/max_1200_webp/5662e1198515621.6642c27088d9c.png"]
  },
  {
    id: "impresso",
    title: "Impressos com alta complexidade",
    category: "Web & Editorial",
    description: "Arquivo digital com gráficos complexos para leitura detalhada de alta qualidade.",
    imageUrl: "https://mir-s3-cdn-cf.behance.net/project_modules/1400_opt_1/dfea75198516381.6642c4bb439f9.png",
    year: "2024",
    gallery: []
  },
  {
    id: "3d",
    title: "Personagem 3d",
    category: "3d",
    description: "Animação de personagem e ambientação.",
    imageUrl: "https://mir-cdn.behance.net/v1/rendition/project_modules/max_1200_webp/4668b2230605957.68799f1fd1f5d.png",
    year: "2025",
    gallery: ["https://www.youtube.com/watch?v=g0FeBc4cKFY"]
  },
  {
    id: "Nova Marca",
    title: "Vossko Haus",
    category: "Brand Design",
    description: "Da Alemanha para o Brasil, da indústria direto ao consumidor.",
    imageUrl: "https://mir-s3-cdn-cf.behance.net/project_modules/hd_webp/fd1b44120280421.60aea6f7eb89e.png",
    year: "2024",
    gallery: []
  },
  {
    id: "Modelo 3d",
    title: "F1 para o videogame",
    category: "3d Model",
    description: "Se as equipes de F1 entrassem no videogame",
    imageUrl: "https://mir-s3-cdn-cf.behance.net/project_modules/1400_webp/9a3f8b138228649.621905f825258.png",
    year: "2023",
    gallery: []
  },
  {
    id: "Flamingo",
    title: "Animamos uma imagem",
    category: "3d Model",
    description: "Uma inspiração do Adobe Photoshop nos trouxe a animar essa imagem",
    imageUrl: "https://mir-s3-cdn-cf.behance.net/project_modules/hd_webp/978c9f194417605.65fb992508f10.jpeg", 
    year: "2023",
    gallery: ["https://mir-s3-cdn-cf.behance.net/project_modules/hd_webp/2d5ec8194417605.65fb99250996a.png", "https://mir-s3-cdn-cf.behance.net/project_modules/max_1200_webp/75c6d1194417605.65fb992507a59.png", "https://youtu.be/gQoHX3Ayqrg?si=QrLV2c9IV_nqdiIk"]
  },
  {
    id: "Troca",
    title: "Troca de embalagem",
    category: "3d Model",
    description: "Uma brincadeira que mostra várias possibilidades",
    imageUrl: "https://mir-s3-cdn-cf.behance.net/project_modules/1400_webp/732c15117407191.6082255ee3e37.png", 
    year: "2023",
    gallery: ["https://youtu.be/kCNAr4UrFL4?si=FPutcJ78gmZqkj3-", "https://mir-s3-cdn-cf.behance.net/project_modules/max_1200/cc193c117407191.6075695f3ce21.jpg" , "https://mir-s3-cdn-cf.behance.net/project_modules/1400_webp/4f13f1117407191.6082255ee36ea.jpg"]
  }
];















