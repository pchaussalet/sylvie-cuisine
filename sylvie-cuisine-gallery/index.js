addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

const apiKey = API_KEY;

/**
 * Respond with hello worker text
 * @param {Request} request
 */
async function handleRequest(request) {
  const { groups: { operation, id } } = request.url.match(/https:\/\/.*\/(?<operation>(galleries|images))\/(?<id>[a-zA-Z0-9_-]+)/);
  if (id) {
    return (
      operation === 'galleries' ? getGalleries(id) :
        operation === 'images' ? getImages(id) :
          getInvalidError()
    );
  }
  return getInvalidError()
}

const getInvalidError = () => new Response('Invalid request', { status: 400 });

const getGalleries = async (parentId) => {
  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=%27${parentId}%27%20in%20parents&key=${apiKey}&fields=files(id,name,description,mimeType)`
  );
  const { files } = await response.json();
  const children = files
    .filter(({ mimeType }) => mimeType === 'application/vnd.google-apps.folder')
    .map(({ id, name, description }) => ({ id, name, description }))
  return new Response(
    JSON.stringify(Array.from(children)),
    {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'content-type': 'application/json'
      }
    }
  );
};

const getImages = async (parentId) => {
  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=%27${parentId}%27%20in%20parents&key=${apiKey}&fields=files(id,name,description,mimeType,thumbnailLink,webContentLink)`
  );
  const { files } = await response.json();
  const children = files
    .filter(({ mimeType }) => mimeType.startsWith('image/'))
    .map(({ id, name, description, thumbnailLink, webContentLink }) => ({ id, name, description, thumbnailLink, webContentLink }))
  return new Response(
    JSON.stringify(Array.from(children)),
    {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'content-type': 'application/json'
      }
    }
  );

};