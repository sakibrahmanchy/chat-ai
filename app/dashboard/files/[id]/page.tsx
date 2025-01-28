import PdfView from "@/components/pdf-view";
import { adminDb } from "@/firebase-admin";
import { auth } from "@clerk/nextjs/server"
import Chat from "@/components/chat";

async function ChatToFilePage({ params }: any) {
  const { id } = await params  
  auth.protect();
  const { userId } = await auth();

  if(!userId) return <span />

  const ref = await adminDb
  .collection('users')
  .doc(userId)
  .collection('files')
  .doc(id)
  .get()

  const url = ref.data()?.downloadUrl;
 console.log(url)
  return (
    <div className="grid lg:grid-cols-5 h-screen overflow-hidden">
        <div className="col-span-5 lg:col-span-2 overflow-y-auto"><Chat id={id} /></div>
        <div className="col-span-5 lg:col-span-3 bg-gray-100 border-r-2 lg:border-indigo-600 lg:-order-1 overflow-scroll pb-20"><PdfView url={url} /></div> 
    </div>
  )
}
export default ChatToFilePage