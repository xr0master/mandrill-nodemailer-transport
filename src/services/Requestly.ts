import {request, RequestOptions} from 'https';
import {ClientRequest, IncomingMessage} from 'http';

export namespace Requestly {

  function sendRequest(options: RequestOptions, params?: any): Promise<any> {
    return new Promise((resolve, reject) => {
      let req: ClientRequest = request(options, (res: IncomingMessage) => {
        let chunks: Array<any> = [];

        res.on('data', (chunk) => chunks.push(chunk));

        res.on('end', () => {
          let answer: any = JsonParse(Buffer.concat(chunks).toString());

          if (res.statusCode === 200) {
            resolve(answer);
          } else {
            reject(answer);
          }
        });

        res.on('error', (error) => {
          reject(error);
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      if (params) {
        req.write(params);
      }

      req.end();
    });
  }

  export function postJSON(options: RequestOptions, data: Object): Promise<any> {
    let json: string = JSON.stringify(data);

    options.method = 'POST';
    options.headers = {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(json)
    };

    return sendRequest(options, json);
  }
}

function JsonParse(value: string): any {
  try {
    return JSON.parse(value);
  }
  catch (error) {
    return undefined;
  }
}
