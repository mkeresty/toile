import type {Metadata} from "next";import "./globals.css";import "./layers.css";
export const metadata:Metadata={title:"Toile Parallax",description:"A scrolling layered Mediterranean toile illustration."};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
