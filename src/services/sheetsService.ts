import Papa from 'papaparse';
import { Project } from '../constants';

export const SHEETS_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTSVqgUkMyTHTxTtA9A8JsteNOkBA6oAbXYehGV6AND7oFOuXC3GD0Fmcmf1bD_K31E1tD30GDxu_mu/pub?gid=1778764506&single=true&output=csv";

export const fetchProjectsFromSheets = async (url: string = SHEETS_CSV_URL): Promise<Project[]> => {
  try {
    const response = await fetch(url);
    const csvData = await response.text();
    
    return new Promise((resolve, reject) => {
      Papa.parse(csvData, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const projects: Project[] = results.data.map((row: any) => ({
            id: String(row.id || '').trim(),
            title: String(row.title || '').trim(),
            category: String(row.category || '').trim(),
            description: String(row.description || '').trim(),
            detailedDescription: String(row.detailedDescription || row.detailed_description || row.secondaryText || row.secondary_text || row.detalhes || '').trim(),
            imageUrl: String(row.imageUrl || '').trim(),
            year: String(row.year || '').trim(),
            gallery: row.gallery ? row.gallery.split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0) : []
          }));

          // Filter out rows that don't have minimum required data
          const validProjects = projects.filter(p => p.id && p.title && p.imageUrl);
          
          if (validProjects.length > 0) {
            resolve(validProjects);
          } else {
            reject(new Error("No valid projects found in sheet"));
          }
        },
        error: (error: any) => {
          reject(error);
        }
      });
    });
  } catch (error) {
    console.error("Error fetching from Google Sheets:", error);
    throw error;
  }
};
