import { Base64 } from 'js-base64';
import Url from 'url-parse';
import RPCModule from '../../components/RPCModule';
import ZcashURITarget from './ZcashURITarget';

const parseZcashURI = async (uri: string): Promise<string | ZcashURITarget> => {
  if (!uri || uri === '') {
    return 'Bad URI';
  }

  const parsedUri = new Url(uri, true);
  if (!parsedUri || parsedUri.protocol !== 'zcash:') {
    return 'Bad URI';
  }
  //console.log(parsedUri);

  const targets: Map<number, ZcashURITarget> = new Map();

  // The first address is special, it can be the "host" part of the URI
  const address = parsedUri.pathname;

  const resultParse = await RPCModule.execute('parse', address);
  //console.log('parse', resultParse);
  const resultParseJSON = await JSON.parse(resultParse);

  const validParse = resultParseJSON.status === 'success';

  if (address && !validParse) {
    return `"${address || ''}" was not a valid zcash address (UA, Orchard, Z or T)`;
  }

  // Has to have at least 1 element
  const t = new ZcashURITarget();
  if (address) {
    t.address = address;
  }
  targets.set(0, t);

  // Go over all the query params
  const params = parsedUri.query;

  for (const [q, value] of Object.entries(params)) {
    const [qName, qIdxS, extra] = q.split('.');
    if (typeof extra !== 'undefined') {
      return `"${q}" was not understood as a valid parameter`;
    }

    if (typeof value !== 'string') {
      return `Didn't understand parameter value "${q}"`;
    }

    const qIdx = parseInt(qIdxS, 10) || 0;

    if (!targets.has(qIdx)) {
      targets.set(qIdx, new ZcashURITarget());
    }

    const target = targets.get(qIdx);
    if (!target) {
      return `Unknown index ${qIdx}`;
    }

    switch (qName.toLowerCase()) {
      case 'address':
        if (typeof target.address !== 'undefined') {
          return `Duplicate parameter "${qName}"`;
        }
        const result = await RPCModule.execute('parse', value);
        //console.log('parse', result);
        const resultJSON = await JSON.parse(result);

        const valid = resultJSON.status === 'success';

        if (!valid) {
          return `"${value}" was not a recognized zcash address`;
        }
        target.address = value;
        break;
      case 'label':
        if (typeof target.label !== 'undefined') {
          return `Duplicate parameter "${qName}"`;
        }
        target.label = value;
        break;
      case 'message':
        if (typeof target.message !== 'undefined') {
          return `Duplicate parameter "${qName}"`;
        }
        target.message = value;
        break;
      case 'memo':
        if (typeof target.memoBase64 !== 'undefined') {
          return `Duplicate parameter "${qName}"`;
        }

        // Parse as base64
        try {
          target.memoString = Base64.decode(value);
          target.memoBase64 = value;
        } catch (e) {
          return `Couldn't parse "${value}" as base64`;
        }

        break;
      case 'amount':
        if (typeof target.amount !== 'undefined') {
          return `Duplicate parameter "${qName}"`;
        }
        const a = parseFloat(value);
        if (isNaN(a)) {
          return `Amount "${value}" could not be parsed`;
        }

        target.amount = a;
        break;
      default:
        return `Unknown parameter "${qName}"`;
    }
  }

  // Make sure everyone has at least an amount and address
  if (targets.size > 1) {
    for (const [key, value] of targets) {
      if (typeof value.amount === 'undefined') {
        return `URI ${key} didn't have an amount`;
      }

      if (typeof value.address === 'undefined') {
        return `URI ${key} didn't have an address`;
      }
    }
  } else {
    // If there is only 1 entry, make sure it has at least an address
    if (!targets.get(0)) {
      return 'URI Should have at least 1 entry';
    }

    if (typeof targets.get(0)?.address === 'undefined') {
      return `URI ${0} didn't have an address`;
    }
  }

  // Convert to plain array
  const ans: ZcashURITarget[] = new Array(targets.size);
  targets.forEach((tgt, idx) => {
    ans[idx] = tgt;
  });

  // Make sure no elements were skipped
  //const testAns: ZcashURITarget[] = ans;
  //if (testAns.includes(undefined)) {
  //  return 'Some indexes were missing';
  //}

  // if the URI have several addresses I get only the first one.
  return ans[0];
};

export default parseZcashURI;
