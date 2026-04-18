import './components/styles/style.scss';

function importAll(r) {
  return r.keys().map(r);
}

const images = importAll(require.context('./components/img', true, /\.(png|jpe?g|svg|webp|gif)$/));