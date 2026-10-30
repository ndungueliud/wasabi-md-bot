module.exports = async (sock, from, args) => {
  const url = args[0]
  if (!url) return sock.sendMessage(from, { text: "Provide link: .yt <youtube link>" })
  // Use your downloader API here
  // Example: const data = await axios.get(`https://api.yourdownloader.com/yt?url=${url}`)
  sock.sendMessage(from, { text: `Downloading from ${url}...` })
  // For IG with Instaprime: call your instaprime app API
}
