import { auth } from "@clerk/nextjs/server"
import PlaceHolderDocument from "./placeholder-document"
import { adminDb } from "@/firebase-admin";
import Document from "./document";

async function Documents() {
  auth.protect()

  const { userId } = await auth();

  if (!userId) {
    throw new Error("User not found");
  }

  const documentSnapshots = await adminDb
  .collection("users")
  .doc(userId)
  .collection("files")
  .get()

  return (
    <div className="flex flex-wrap p-5 bg-gray-100 justify-center 
    lg:justify-start rounded-sm gap-5 max-w-7xl mx-auto overflow-auto h-screen pb-44">
        {documentSnapshots.docs.map(async doc => {
          const { name, downloadUrl, size } = await doc.data();

          return <Document 
            key ={doc.id}
            id={doc.id}
            name={name}
            size={size}
            downloadUrl={downloadUrl}
          />
        })}

      
        <PlaceHolderDocument />
    </div>
  )
}
export default Documents