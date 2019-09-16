import {Transport, SendMailOptions} from 'nodemailer';
import {Requestly} from './services/Requestly';
import {Mandrill} from './models/Mandrill';

export interface Options {
  apiKey: string;
}

export class MandrillTransport implements Transport {

  public name: string = 'MandrillTransport';
  public version: string = 'N/A';

  constructor(private options: Options) {}

  public send(mail: any, done: Function): void {
    setImmediate(() => {
      mail.normalize((error, data: SendMailOptions) => {
        if (error) return done(error);

        let mandrill: Mandrill = new Mandrill(this.options.apiKey);
        mandrill.setMessage(data);

        Requestly.postJSON({
          protocol: 'https:',
          hostname: 'mandrillapp.com',
          path: '/api/1.0/messages/send.json'
        }, mandrill)
          .then(() => {
            done(null, {
              envelope: mail.message.getEnvelope(),
              messageId: mail.message.messageId(),
              message: mandrill.message
            });
          })
          .catch((e) => done(e));
      });
    });
  }
}

export default MandrillTransport;
