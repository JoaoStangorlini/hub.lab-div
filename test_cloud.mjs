const formData = new FormData();
formData.append("upload_preset", "ifusp_uploads");
formData.append("file", "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7");

const res = await fetch("https://api.cloudinary.com/v1_1/dgpulbaqq/image/upload", {
    method: "POST",
    body: formData
});

console.log("Status:", res.status);
console.log("Response:", await res.json());
