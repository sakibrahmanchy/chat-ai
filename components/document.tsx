'use client';
import { useRouter } from "next/navigation"

function Document({ id, name, size, downloadUrl }) {
  const router = useRouter();


  return (
    <div 
        className="flex flex-col w-64 h-80 rounded-xl bg-white drop-shadow-md hover:bg-indigo-600 hover:text-white cursor-pointer group p-4 transition-all transform hover:scale-105"
        onClick={() => router.push(`/dashboard/files/${id}`)}
    >
        <p className="font-semibold line-clamp-2 ">{name}</p>
    </div>
  )
}
export default Document