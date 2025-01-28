'use client';
import useUpload, { StatusText } from '@/hooks/use-upload';
import { CheckCircleIcon, CircleArrowDown, HammerIcon, RocketIcon, SaveIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useCallback, useEffect } from 'react'
import { useDropzone } from 'react-dropzone';


function FileUploader() {
    const [progress, status, fileId, handleUpload] = useUpload();
    const router = useRouter();
    useEffect(() => {
        if (fileId) {
            router.push(`/dashboard/files/${fileId}/`)
        }
    }, [fileId, router])

    const statusIcons = {
        [StatusText.UPLOADING]: (<RocketIcon className="h-20 w-20 text-indigo-600" />),
        [StatusText.UPLOADED]: (<CheckCircleIcon className="h-20 w-20 text-indigo-600" />),
        [StatusText.SAVING]: (<SaveIcon className="h-20 w-20 text-indigo-600" />),
        [StatusText.GENERATING]: (<HammerIcon className="h-20 w-20 text-indigo-600 animate-bounce" />),
    }

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        if (acceptedFiles.length) {
            const file = acceptedFiles[0]
            if (file) {
                await handleUpload(file)
            } else {

            }
        } else {
            // throw error
        }
    }, [])
    const {
        getRootProps,
        getInputProps,
        isDragActive,
        isFocused,
        isDragAccept
    } = useDropzone({
        onDrop,
        maxFiles: 1,
        accept: {
            'application/pdf': ['.pdf']
        },

    })

    const uploadInProgress = progress !== null && progress >= 0 && progress <= 100;
    console.log(progress, typeof progress, uploadInProgress, status, statusIcons[status])
    return (
        <div className="flex flex-col gap-4 items-center max-w-7xl mx-auto mt-10">
            {uploadInProgress && (<div className="mt-32 flex flex-col justify-center items-center gap-3">
                <div
                    className={`radial-progress bg-indigo-300 text-wite border-indigo-600 
                    border-4 ${progress === 100 && 'hidden'}`}
                    role="progressbar"
                    style={{
                        //@ts-ignore
                        "--value": progress,
                        "--size": "12rem",
                        "--thickness": "1.3rem"
                    }}
                >{progress as number} %</div>

                {
                    statusIcons[status]
                }

                <p className="text-indigo-600 animate-pulse">{status as String}</p>
            </div>)}

            {!uploadInProgress && (<div {...getRootProps()} className={`p-10 border-2 border-dashed w-[90%] 
                border-indigo-600 text-indigo-600 rounded-lg h-96 flex items-center justify-center 
                ${isFocused || isDragAccept ? 'bg-indigo-300' : 'bg-indigo100'}`}>
                <input {...getInputProps()} />
                <div className="flex flex-col items-center gap-4">
                    {
                        isDragActive ?
                            <>
                                <RocketIcon className="h-20 w-20 animate-ping" />
                                <p>Drop the files here ...</p>
                            </> :
                            <>
                                <CircleArrowDown className='h-20 w-20 animate-bounce' />
                                <p>Drag 'n' drop some files here, or click to select files</p>
                            </>
                    }
                </div>

            </div>)}
        </div>
    )
}

export default FileUploader