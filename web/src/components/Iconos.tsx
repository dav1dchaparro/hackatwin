// Íconos en línea (trazo 1.8, 24 px). Sin librerías: así funcionan igual sin internet en el demo day.
import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement> & { tam?: number };
function Svg({ tam = 18, children, ...p }: P) {
  return (
    <svg width={tam} height={tam} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...p}>
      {children}
    </svg>
  );
}
export const IcoLlave = (p: P) => <Svg {...p}><circle cx="7.5" cy="15.5" r="4.5" /><path d="M10.7 12.3 21 2m-3.5 3.5L20 8m-5.5-.5L17 10" /></Svg>;
export const IcoCasa = (p: P) => <Svg {...p}><path d="M3 11.5 12 4l9 7.5" /><path d="M5 10v10h5v-6h4v6h5V10" /></Svg>;
export const IcoHerencia = (p: P) => <Svg {...p}><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20a6.5 6.5 0 0 1 13 0" /><path d="M16 4.5a3.5 3.5 0 0 1 0 7" /><path d="M18.5 14.5a5.5 5.5 0 0 1 3 5.5" /></Svg>;
export const IcoPanel = (p: P) => <Svg {...p}><rect x="3" y="4" width="18" height="12" rx="2" /><path d="M8 20h8m-4-4v4" /></Svg>;
export const IcoSalir = (p: P) => <Svg {...p}><path d="M10 4H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h5" /><path d="M14 16l4-4-4-4m4 4H9" /></Svg>;
export const IcoEntrar = (p: P) => <Svg {...p}><path d="M14 4h5a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-5" /><path d="M9 8l4 4-4 4m4-4H3" /></Svg>;
export const IcoReloj = (p: P) => <Svg {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></Svg>;
export const IcoCheck = (p: P) => <Svg {...p}><path d="M5 12.5 10 17 19 7" /></Svg>;
export const IcoAlerta = (p: P) => <Svg {...p}><path d="M12 3 2.5 20h19L12 3Z" /><path d="M12 9v5m0 3h.01" /></Svg>;
export const IcoInfo = (p: P) => <Svg {...p}><circle cx="12" cy="12" r="9" /><path d="M12 11v5m0-8h.01" /></Svg>;
export const IcoRobot = (p: P) => <Svg {...p}><rect x="4" y="8" width="16" height="11" rx="2" /><path d="M12 4v4M8 4h8" /><circle cx="9" cy="13" r="1" fill="currentColor" stroke="none" /><circle cx="15" cy="13" r="1" fill="currentColor" stroke="none" /><path d="M9 16.5h6" /></Svg>;
export const IcoEscudo = (p: P) => <Svg {...p}><path d="M12 3 4.5 6v5.5c0 4.5 3 7.8 7.5 9.5 4.5-1.7 7.5-5 7.5-9.5V6L12 3Z" /><path d="m9 12 2 2 4-4" /></Svg>;
export const IcoRayo = (p: P) => <Svg {...p}><path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" /></Svg>;
export const IcoFlecha = (p: P) => <Svg {...p}><path d="M5 12h14m-6-6 6 6-6 6" /></Svg>;
export const IcoMas = (p: P) => <Svg {...p}><path d="M12 5v14M5 12h14" /></Svg>;
export const IcoX = (p: P) => <Svg {...p}><path d="M6 6l12 12M18 6 6 18" /></Svg>;
export const IcoSol = (p: P) => <Svg {...p}><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M2 12h2m16 0h2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M4.9 19.1l1.4-1.4m11.4-11.4 1.4-1.4" /></Svg>;
export const IcoLuna = (p: P) => <Svg {...p}><path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5Z" /></Svg>;
export const IcoBilletera = (p: P) => <Svg {...p}><rect x="3" y="6" width="18" height="13" rx="2" /><path d="M3 10h18M16 14.5h2" /></Svg>;
export const IcoCorazon = (p: P) => <Svg {...p}><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z" /></Svg>;
export const IcoEnviar = (p: P) => <Svg {...p}><path d="M21 3 10 14m11-11-7 18-4-7-7-4 18-7Z" /></Svg>;
