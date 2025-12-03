import { useState, useEffect, useRef } from "react";
import HTMLFlipBook from "react-pageflip";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf";
import pdfjsWorker from "pdfjs-dist/legacy/build/pdf.worker.min.js?url";
import "./App.css";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

function App() {
  const [images, setImages] = useState([]);
  const [bookSize, setBookSize] = useState({ width: 600, height: 800 });
  const flipBookRef = useRef(null);

  // 🔹 Responsividade
  useEffect(() => {
    function handleResize() {
      // const w = window.innerWidth;
      // if (w < 500) setBookSize({ width: 280, height: 400 });
      // else if (w < 800) setBookSize({ width: 400, height: 600 });
       setBookSize({ width: 600, height: 800 });
    }

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);


  // Carrega PDF automaticamente ao montar o componente
  useEffect(() => {
    async function loadPdf() {
      try {
        const pdfUrl = "/public/revista.pdf"; 

        const pdf = await pdfjsLib.getDocument(pdfUrl).promise;
        const pages = [];

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 2 });

          const canvas = document.createElement("canvas");
          canvas.width = viewport.width;
          canvas.height = viewport.height;

          const ctx = canvas.getContext("2d");
          await page.render({ canvasContext: ctx, viewport }).promise;

          pages.push(canvas.toDataURL("image/png"));
        }

        setImages(pages);
      } catch (error) {
        console.error("Erro ao carregar PDF:", error);
      }
    }

    loadPdf();
  }, []);

  return (
    <div className="container">
      {images.length === 0 && <p>Carregando revista...</p>}

      {images.length > 0 && (
        <div className="flipbook-container">
          <HTMLFlipBook
            width={bookSize.width}
            height={bookSize.height}
            size="stretch"
            minWidth={200}
            maxWidth={800}
            maxHeight={1000}
            minHeight={200}
            showCover={true}
            flippingTime={600}      
            swipeDistance={1}       
            maxShadowOpacity={0.4}
            mobileScrollSupport={true}
            ref={flipBookRef}
          >
            {images.map((src, i) => (
              <div className="page" key={i}>
                <img src={src} alt={`Página ${i + 1}`} draggable={false} />
              </div>
            ))}
          </HTMLFlipBook>
        </div>
      )}
    </div>
  );
}

export default App;
