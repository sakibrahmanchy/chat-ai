'use client';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

import { Document, Page, pdfjs } from 'react-pdf';
import { useEffect, useRef, useState } from 'react';
import { Layer, Rect, Stage } from 'react-konva';
import { Button } from './ui/button';
import { Loader2Icon, RotateCw, ZoomInIcon, ZoomOutIcon } from 'lucide-react';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

function PdfView({ url }) {
    const [numPages, setNumPages] = useState(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [file, setFile] = useState(null);
    const [rotation, setRotation] = useState(0);
    const [scale, setScale] = useState(1);
    const canvasRef = useRef(null);
    
    const [selection, setSelection] = useState(null);
    const [isSelecting, setIsSelecting] = useState(false);
    const pdfContainerRef = useRef(null);

    useEffect(() => {
        const fetchFile = async () => {
            const response = await fetch(url);
            const file = await response.blob();
            setFile(file);
        };
        fetchFile();
    }, [url]);

    const onDocumentLoadSuccess = ({ numPages }) => {
        setNumPages(numPages);
    };

    const handleMouseDown = (e) => {
        const container = pdfContainerRef.current.getBoundingClientRect();
        const x = e.clientX - container.left;
        const y = e.clientY - container.top;
        setSelection({ x, y, width: 0, height: 0 });
        setIsSelecting(true);
    };

    const handleMouseMove = (e) => {
        if (!isSelecting || !selection) return;
        const container = pdfContainerRef.current.getBoundingClientRect();
        const newWidth = e.clientX - container.left - selection.x;
        const newHeight = e.clientY - container.top - selection.y;
        setSelection({ ...selection, width: newWidth, height: newHeight });
    };

    const handleMouseUp = () => {
        setIsSelecting(false);
        if (selection.width > 10 && selection.height > 10) {
            takeScreenshotOfSelection(selection);
        }
    };

    const takeScreenshotOfSelection = (selection) => {
        console.log({ selection });
    
        // Find the canvas inside the PDF page
        const pageCanvas = document.querySelector('.react-pdf__Page canvas');
        if (!pageCanvas) {
            console.error("Canvas not found inside .react-pdf__Page");
            return;
        }
    
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
    
        // Set canvas size to match the selection
        canvas.width = selection.width;
        canvas.height = selection.height;
    
        // Draw the selected portion of the page canvas onto our new canvas
        context.drawImage(
            pageCanvas, // Source: actual React-PDF rendered canvas
            selection.x, selection.y, selection.width, selection.height, // Source position & size
            0, 0, selection.width, selection.height // Destination position & size
        );
    
        // Convert to base64
        const imageData = canvas.toDataURL();
        console.log(imageData); // This is the captured image
    };


    return (
        <div className='flex flex-col items-center justify-center pt-20'>
            <div className="sticky top-0 z-100 bg-gray-100 p-2 rounded-b-lg">
                <div className='max-w-6xl px-2 grid grid-cols-6 gap-2'>
                    <Button
                        variant="outline"
                        disabled={pageNumber === 1}
                        onClick={() => setPageNumber(pageNumber - 1)}
                    >Previous</Button>
                    <p className="flex items-center justify-center">
                        {pageNumber} of {numPages}
                    </p>
                    <Button
                        variant="outline"
                        disabled={pageNumber === numPages}
                        onClick={() => setPageNumber(pageNumber + 1)}
                    >Next</Button>
                    <Button
                        variant="outline"
                        onClick={() => setRotation((rotation + 90) % 360)}
                    ><RotateCw /></Button>
                    <Button
                        variant="outline"
                        disabled={scale >= 1.5}
                        onClick={() => setScale(scale * 1.2)}
                    ><ZoomInIcon /></Button>
                    <Button
                        variant="outline"
                        disabled={scale <= 0.75}
                        onClick={() => setScale(scale / 1.2)}
                    ><ZoomOutIcon /></Button>
                </div>
            </div>

            <div ref={pdfContainerRef} className="relative" onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}>
                {!file ? (
                    <Loader2Icon className="animate-spin h-20 w-20 text-indigo-600 mt-20" />
                ) : (
                    <Document file={file} onLoadSuccess={onDocumentLoadSuccess} rotate={rotation}>
                        <Page className="shadow-lg" scale={scale} pageNumber={pageNumber} />
                    </Document>
                )}
                {selection && (
                    <Stage width={600} height={800} className="absolute top-0 left-0">
                        <Layer>
                            <Rect
                                x={selection.x}
                                y={selection.y}
                                width={selection.width}
                                height={selection.height}
                                stroke="blue"
                                strokeWidth={2}
                                fill="rgba(0, 0, 255, 0.2)"
                            />
                        </Layer>
                    </Stage>
                )}
            </div>

            <canvas ref={canvasRef} style={{ display: 'none' }} />  
        </div>
    );
}

export default PdfView;
