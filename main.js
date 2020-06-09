class GameOfLife {
    constructor(w, h, ratio) {
        this.fieldContainer = document.getElementById('container');
        this.randomizeButton = document.getElementById('button__randomize');
        this.clearButton = document.getElementById('button__clear');
        this.timeoutButton = document.getElementById('button__timeout');
        this.sizeButton = document.getElementById('button__size');
        this.stepsContainer = document.getElementById('steps');
        this.w = w;
        this.h = h;
        this.ratio = ratio || 0.3;
        this.map = new Map();
        this.inProgress = false;
        this.timeout = 200;
        this.steps = 0;

        this.randomize = this.randomize.bind(this);
        this.clearField = this.clearField.bind(this);
        this.start = this.start.bind(this);
        this.onCellClick = this.onCellClick.bind(this);
        this.setTimeout = this.setTimeout.bind(this);
        this.setFieldSize = this.setFieldSize.bind(this);

        this.fieldContainer.addEventListener('click', this.onCellClick);
        this.randomizeButton.addEventListener('click', this.randomize);
        this.clearButton.addEventListener('click', this.clearField);
        this.timeoutButton.addEventListener('click', this.setTimeout);
        this.sizeButton.addEventListener('click', this.setFieldSize);
        this.field = this.generateRandomField();
        this.render();
    }

    generateRandomField(clear) {
        const len = this.w * this.h;
        const temp = !clear ?
            Array.from(new Array(len), () => Math.floor(Math.random() - (1 - this.ratio) + 1)) :
            Array.from(new Array(len), () => 0);
        const res = [];

        for (let i = 0; i < len; i+=this.w) {
            res.push(temp.slice(i, i + this.w));
        }

        return res;
    }

    render() {
        this.fieldContainer.innerHTML = '';
        for(let i = 0; i < this.field.length; i++) {
            let row = document.createElement('div');
            row.classList.add('row');
            for (let k = 0; k < this.field[i].length; k++) {
                const cell = document.createElement('div');
                cell.classList.add('cell');
                const val = this.field[i][k];
                cell.classList.add(val ? 'alive' : 'dead');
                cell.dataset.x = i;
                cell.dataset.y = k;
                row.appendChild(cell)
            }
            this.fieldContainer.appendChild(row);
        }
    }

    onCellClick(e) {
        const x = parseInt(e.target.dataset.x);
        const y = parseInt(e.target.dataset.y);
        if (isNaN(x) || isNaN(y)) return;
        this.field[x][y] = this.field[x][y] ? 0 : 1;
        this.render();
    }

    randomize() {
        const r = document.getElementById('ratio').value;
        this.ratio = parseFloat(r);
        this.field = this.generateRandomField();
        this.render();
    }

    setTimeout() {
        const t = document.getElementById('timeout').value;
        this.timeout = parseInt(t);
    }

    setFieldSize() {
        const w = document.getElementById('w').value;
        const h = document.getElementById('h').value;
        this.w = parseInt(w);
        this.h = parseInt(h);
        this.field = this.generateRandomField();
        this.render();
    }

    clearField() {
        this.field = this.generateRandomField(true);
        this.render();
    }

    doStep() {
        return new Promise((resolve) => {
            setTimeout(() => {
                const copy = [];
                for (let i = 0; i < this.field.length; i++) {
                    copy.push([]);
                    for (let k = 0; k < this.field[i].length; k++) {
                        const current = this.field[i][k];
                        const neighbours = [
                            this.field[i][k - 1],
                            this.field[i][k + 1],
                            i > 0 ? this.field[i - 1][k] : 0,
                            i > 0 ? this.field[i - 1][k - 1] : 0,
                            i > 0 ? this.field[i - 1][k + 1] : 0,
                            i < this.field.length - 1 ? this.field[i + 1][k] : 0,
                            i < this.field.length - 1 ? this.field[i + 1][k - 1] : 0,
                            i < this.field.length - 1 ? this.field[i + 1][k + 1] : 0
                        ];
                        const numOfAlive = neighbours.reduce((acc, cur) => cur ? acc + 1 : acc, 0);

                        copy[i][k] = current ?
                            (numOfAlive < 2 || numOfAlive > 3 ? 0 : 1) :
                            (numOfAlive === 3 ? 1 : 0);
                    }
                }
                this.steps++;
                this.stepsContainer.innerHTML = this.steps;

                const stateString = copy.toString();
                if (this.map.has(stateString)) {
                    console.log('the end');
                    this.inProgress = false;
                    this.render();
                    resolve();
                    return;
                }

                this.field = copy;
                this.map.set(stateString, null);
                this.render();
                resolve();
            }, this.timeout);
        });
    }

    async start() {
        if (this.inProgress) return;
        this.inProgress = true;
        this.map.clear();
        this.steps = 0;
        this.render();
        while (this.inProgress) {
            await this.doStep();
        }
    }
}

const game = new GameOfLife(20, 20, 0.3);
