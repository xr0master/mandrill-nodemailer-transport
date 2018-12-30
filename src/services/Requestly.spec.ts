import {Requestly} from './Requestly';

test ('send post JSON request', () => {
  expect.assertions(1);

  return Requestly.postJSON({
    protocol: 'https:',
    hostname: 'httpbin.org',
    path: '/post'
  }, {
    user_id: 'test'
  })
  .then((resolve) => {
    expect(resolve).toBeDefined();
  }, (error) => {
    throw error;
  });
});
