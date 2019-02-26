import './css/styles.scss';
import html from './templates/bar.ejs.html';
import text from './templates/foo.ejs.txt';

const templateLocals = {
    content: 'Yay!'
};

document.getElementById('output')!.innerText = html(templateLocals);
document.querySelector('input')!.value = text(templateLocals);
