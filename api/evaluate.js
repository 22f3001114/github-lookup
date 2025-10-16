export default function handler(req, res) {
  const secretExpected = "Blobbing123"; // <-- Change this to your actual secret!

  if (req.method === 'POST') {
    const { repoUrl, secret } = req.body || {};
    if (secret !== secretExpected) {
      res.status(403).json({ status: 'error', message: 'Invalid secret.' });
    } else {
      res.status(200).json({
        status: 'ok',
        repoUrl,
        message: 'Repo received and secret validated.'
      });
    }
  } else {
    res.status(405).json({ status: 'error', message: 'Only POST accepted.' });
  }
}
