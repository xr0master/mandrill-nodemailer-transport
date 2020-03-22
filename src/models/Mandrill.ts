import {SendMailOptions} from 'nodemailer';
import {Address} from 'nodemailer/lib/mailer';

const TRANSFORM_FIELDS: object = {
  replyTo: 'Reply-To'
};

const TO_KEYS: Array<To['type']> = ['to', 'cc', 'bcc'];
const HEADERS: Array<string> = ['replyTo'];

interface To {
  email: string;
  name?: string;
  type?: 'to' | 'cc' | 'bcc';
}

interface Attachments {
  type: string;
  name: string;
  content: string;
}

export class Mandrill {

  public key: string;
  public message: any;

  constructor(apiKey: string) {
    this.key = apiKey;
  }

  private getFromName(data: SendMailOptions): string {
    if (data.from) {
      return (<Address>data.from).name || '';
    }

    return '';
  }

  private getFromAddress(data: SendMailOptions): string {
    if (data.from) {
      return (data.from as Address).address || '';
    }

    return '';
  }

  private appendAddresses(data: SendMailOptions): Array<To> {
    return TO_KEYS.reduce((accumulator: Array<To>, target) => {
      if (!data[target]) return accumulator;

      (data[target] as Array<Address>).forEach(to => {
        accumulator.push({
          email: to.address,
          name: to.name,
          type: target
        });
      });

      return accumulator;
    }, []);
  }

  private appendAttachments(data: SendMailOptions): Array<Attachments> {
    if (!Array.isArray(data.attachments)) return [];

    return data.attachments.reduce((accumulator: Array<Attachments>, attachment) => {
      if (!attachment.contentType.startsWith('image/')) {
        accumulator.push({
          name: attachment.filename || attachment.cid,
          type: attachment.contentType,
          content: attachment.content as string
        });
      }

      return accumulator;
    }, []);
  }

  private appendImages(data: SendMailOptions): Array<Attachments> {
    if (!Array.isArray(data.attachments)) return [];

    return data.attachments.reduce((accumulator: Array<Attachments>, attachment) => {
      if (attachment.contentType.startsWith('image/')) {
        accumulator.push({
          name: attachment.cid,
          type: attachment.contentType,
          content: attachment.content as string
        });
      }

      return accumulator;
    }, []);
  }

  private appendHeaders(data: SendMailOptions): Object {
    return HEADERS.reduce((headers, key) => {
      if (data[key]) {
        headers[TRANSFORM_FIELDS[key] || key] = data[key];
      }

      return headers;
    }, {});
  }

  public setMessage(data: SendMailOptions): void {
    this.message = {
      html: data.html,
      text: data.text,
      subject: data.subject,
      from_email: this.getFromAddress(data),
      from_name: this.getFromName(data),
      to: this.appendAddresses(data),
      headers: this.appendHeaders(data),
      attachments: this.appendAttachments(data),
      images: this.appendImages(data)
    };
  }
}
