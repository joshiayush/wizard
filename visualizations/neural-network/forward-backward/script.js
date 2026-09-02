/**
 * How a Neural Network Learns — Forward & Backward (Visualizer)
 * Tiny 2-2-1 network, sigmoid hidden, linear output, MSE.
 */

class NNVisualizer extends VisualizerBase {
    constructor() {
        super({ codeLineCount: 14 });
        // fixed initial weights matching the brief
        this.initWeights = {
            w11: 0.5, w12: 0.2, b1: 0.1,
            w21: 0.3, w22: -0.4, b2: -0.2,
            wo1: 0.8, wo2: -0.5, b0: 0.2
        };
        this.weights = { ...this.initWeights };
        this.x1 = 1.5; this.x2 = -2.0; this.yTrue = 0.1; this.lr = 1.0;

        // computed forward values
        this.z1 = null; this.a1 = null; this.z2 = null; this.a2 = null; this.yHat = null; this.loss = null;
        // backward values
        this.delta = null; this.d_wo1=null; this.d_wo2=null; this.d_b0=null;
        this.blame1=null; this.delta1=null; this.d_w11=null; this.d_w12=null; this.d_b1=null;
        this.blame2=null; this.delta2=null; this.d_w21=null; this.d_w22=null; this.d_b2=null;
        this.sig1=null; this.sig2=null;

        this.stepIdx = 0;
        // steps: 0 init, 1 z1,2 a1,3 z2,4 a2,5 yhat,6 loss,7 delta,8 dWo,9 blame1,10 delta1,11 dw1,12 blame2+delta2,13 dw2,14 update
        this.totalSteps = 14;
    }

    sigmoid(z){ return 1/(1+Math.exp(-z)); }

    parseInputs(){
        const v = (id, def) => {
            const el=document.getElementById(id);
            if(!el) return def;
            const n=parseFloat(el.value);
            return isNaN(n)?def:n;
        };
        this.x1=v('x1Input',1.5);
        this.x2=v('x2Input',-2.0);
        this.yTrue=v('yTrueInput',0.1);
        this.lr=v('lrInput',1.0);
    }

    init(){
        this.parseInputs();
        // if reset with custom weights? keep current weights unless randomize triggered
        // On normal reset, restore initWeights but keep user-edited inputs
        // We'll preserve weights if they were randomized? For simplicity reset to init.
        // But detect if this is first init vs user clicking reset after randomize: always restore init? Let randomize set flag.
        if(this._keepWeights){
            this._keepWeights=false;
        } else {
            this.weights={...this.initWeights};
        }
        this.z1=this.a1=this.z2=this.a2=this.yHat=this.loss=null;
        this.delta=this.d_wo1=this.d_wo2=this.d_b0=null;
        this.blame1=this.delta1=this.d_w11=this.d_w12=this.d_b1=null;
        this.blame2=this.delta2=this.d_w21=this.d_w22=this.d_b2=null;
        this.sig1=this.sig2=null;
        this.stepIdx=0;
        this.isFinished=false;
        if(this.isPlaying) this.pause();

        this.renderNetwork();
        this.updateValues();
        this.renderGradTable();
        this.updateInfo();
        this.updateFormula('—', 'ready');
        this.updatePhase('Ready','Click Step to start forward pass','');
        this.clearCodeHighlight();
        this.highlightCode(0);
        this.updateStatus('Network with random weights. We will do dot-product → sigmoid → output → loss, then send blame backwards.');
        this.updateInfoBox('infoStep', `0 / ${this.totalSteps}`);
    }

    randomize(){
        const r = () => (Math.random()*1.2 - 0.6).toFixed(2) *1;
        this.weights.w11 = r(); this.weights.w12 = r(); this.weights.b1 = r()*0.5;
        this.weights.w21 = r(); this.weights.w22 = r(); this.weights.b2 = r()*0.5;
        this.weights.wo1 = r(); this.weights.wo2 = r(); this.weights.b0 = r()*0.5;
        this._keepWeights=true;
        this.init();
        this.renderNetwork();
    }

    // SVG network drawing
    renderNetwork(active={}){
        const svg=document.getElementById('networkSvg');
        if(!svg) return;
        svg.innerHTML='';
        const NS='http://www.w3.org/2000/svg';
        const mk=(tag,attrs)=>{
            const e=document.createElementNS(NS,tag);
            for(const k in attrs) e.setAttribute(k, attrs[k]);
            return e;
        };
        // positions
        const nodes={
            x1:{x:110,y:90, label:'x₁', sub: this.x1.toFixed(2)},
            x2:{x:110,y:250, label:'x₂', sub: this.x2.toFixed(2)},
            h1:{x:380,y:90, label:'h₁', sub: this.z1!==null?`z₁=${this.z1.toFixed(2)}`:'z₁'},
            h2:{x:380,y:250, label:'h₂', sub: this.z2!==null?`z₂=${this.z2.toFixed(2)}`:'z₂'},
            a1:{x:520,y:90, label:'a₁', sub: this.a1!==null?this.a1.toFixed(2):'σ(z₁)'},
            a2:{x:520,y:250, label:'a₂', sub: this.a2!==null?this.a2.toFixed(2):'σ(z₂)'},
            out:{x:750,y:170, label:'ŷ', sub: this.yHat!==null?this.yHat.toFixed(2):'wo·a+b₀'},
        };
        // edges: input->hidden (z computation)
        const edges=[
            {from:'x1',to:'h1', w:this.weights.w11, key:'w11', cls: active.w11?'highlight forward':'forward', label:`w₁₁=${this.weights.w11.toFixed(2)}`},
            {from:'x2',to:'h1', w:this.weights.w12, key:'w12', cls: active.w12?'highlight forward':'forward', label:`w₁₂=${this.weights.w12.toFixed(2)}`},
            {from:'x1',to:'h2', w:this.weights.w21, key:'w21', cls: active.w21?'highlight forward':'forward', label:`w₂₁=${this.weights.w21.toFixed(2)}`},
            {from:'x2',to:'h2', w:this.weights.w22, key:'w22', cls: active.w22?'highlight forward':'forward', label:`w₂₂=${this.weights.w22.toFixed(2)}`},
            {from:'h1',to:'a1', w:null, key:'sig1', cls: active.sig1?'highlight':'dim', label:'σ', isSig:true},
            {from:'h2',to:'a2', w:null, key:'sig2', cls: active.sig2?'highlight':'dim', label:'σ', isSig:true},
            {from:'a1',to:'out', w:this.weights.wo1, key:'wo1', cls: active.wo1?'highlight '+(active.backward?'backward':'forward'):'forward', label:`wo₁=${this.weights.wo1.toFixed(2)}`},
            {from:'a2',to:'out', w:this.weights.wo2, key:'wo2', cls: active.wo2?'highlight '+(active.backward?'backward':'forward'):'forward', label:`wo₂=${this.weights.wo2.toFixed(2)}`},
        ];
        // bias hints
        const biases=[
            {node:'h1', text:`b₁=${this.weights.b1.toFixed(2)}`, cls: active.b1?'highlight forward':'dim'},
            {node:'h2', text:`b₂=${this.weights.b2.toFixed(2)}`, cls: active.b2?'highlight forward':'dim'},
            {node:'out', text:`b₀=${this.weights.b0.toFixed(2)}`, cls: active.b0?'highlight forward':'dim'},
        ];

        // draw edges
        edges.forEach(e=>{
            const f=nodes[e.from], t=nodes[e.to];
            const isSig=e.isSig;
            const line=mk('line',{x1:f.x+38, y1:f.y, x2:t.x-38, y2:t.y, class:`net-edge ${e.cls}`});
            svg.appendChild(line);
            // arrowhead
            const ang=Math.atan2(t.y - f.y, t.x - f.x);
            const ahLen=8;
            const ax=t.x-38, ay=t.y;
            const p1=mk('line',{x1:ax, y1:ay, x2: ax - ahLen*Math.cos(ang - 0.45), y2: ay - ahLen*Math.sin(ang -0.45), class:`net-edge ${e.cls}`, style:'stroke-width:2'});
            const p2=mk('line',{x1:ax, y1:ay, x2: ax - ahLen*Math.cos(ang + 0.45), y2: ay - ahLen*Math.sin(ang +0.45), class:`net-edge ${e.cls}`, style:'stroke-width:2'});
            svg.appendChild(p1); svg.appendChild(p2);
            // weight label midpoint
            const mx=(f.x+t.x)/2, my=(f.y+t.y)/2 + (e.from.startsWith('x') && e.to==='h1' ? -10 : e.from.startsWith('x') && e.to==='h2'?10:0);
            const txt=mk('text',{x: mx, y: my, class:`net-weight ${e.cls.includes('backward')?'backward': e.cls.includes('loss')?'loss':'forward'}`});
            txt.textContent=e.label;
            svg.appendChild(txt);
        });

        // bias labels
        biases.forEach(b=>{
            const n=nodes[b.node];
            const txt=mk('text',{x:n.x, y:n.y+52, class:`net-weight ${b.cls.includes('forward')?'forward':''}`});
            txt.textContent=b.text;
            svg.appendChild(txt);
        });

        // y_true and loss annotation near output
        if(this.loss!==null || this.delta!==null){
            const out=nodes.out;
            const lossTxt=mk('text',{x:out.x, y:out.y+78, class:'net-weight loss'});
            lossTxt.textContent = this.loss!==null ? `L=${this.loss.toFixed(4)}  y=${this.yTrue.toFixed(2)}` : `y=${this.yTrue.toFixed(2)}`;
            svg.appendChild(lossTxt);
            if(this.delta!==null){
                const dTxt=mk('text',{x:out.x, y:out.y+96, class:'net-weight backward'});
                dTxt.textContent = `δ=${this.delta.toFixed(3)} (ŷ−y)`;
                svg.appendChild(dTxt);
            }
        } else {
            const out=nodes.out;
            const yTxt=mk('text',{x:out.x, y:out.y+78, class:'net-weight loss'});
            yTxt.textContent=`y=${this.yTrue.toFixed(2)}`;
            svg.appendChild(yTxt);
        }

        // draw nodes
        Object.entries(nodes).forEach(([k,n])=>{
            const isActive = active[k];
            const g=mk('g',{});
            const circle=mk('circle',{cx:n.x, cy:n.y, r:38, class:`net-node ${k.startsWith('x')?'input': k==='out'?'output':'hidden'} ${isActive?'active':''}`});
            // set stroke color via style? class handles
            svg.appendChild(circle);
            const label=mk('text',{x:n.x, y:n.y-4, class:'net-label'});
            label.textContent=n.label;
            svg.appendChild(label);
            const sub=mk('text',{x:n.x, y:n.y+14, class:'net-sublabel'});
            sub.textContent=n.sub;
            svg.appendChild(sub);
        });

        // layer titles
        const titles=[{x:110,y:22,text:'INPUT'},{x:380,y:22,text:'HIDDEN (z)'},{x:520,y:22,text:'HIDDEN (a=σ(z))'},{x:750,y:22,text:'OUTPUT'}];
        titles.forEach(t=>{
            const txt=mk('text',{x:t.x, y:t.y, class:'net-sublabel'});
            txt.style.fontSize='11px'; txt.style.fill='#00d9ff'; txt.style.letterSpacing='1px';
            txt.textContent=t.text;
            svg.appendChild(txt);
        });
    }

    updateValues(){
        const fmt = (v) => v===null? '—' : v.toFixed(4);
        document.getElementById('val-z1').textContent = this.z1===null?'—':this.z1.toFixed(2);
        document.getElementById('val-z2').textContent = this.z2===null?'—':this.z2.toFixed(2);
        document.getElementById('val-a1').textContent = this.a1===null?'—':this.a1.toFixed(4);
        document.getElementById('val-a2').textContent = this.a2===null?'—':this.a2.toFixed(4);
        document.getElementById('val-yhat').textContent = this.yHat===null?'—':this.yHat.toFixed(4);
        const lossEl=document.getElementById('val-loss');
        if(this.loss===null) lossEl.textContent='—';
        else lossEl.innerHTML = `L=${this.loss.toFixed(4)} <span style="color:#ffd700">δ=${this.delta!==null?this.delta.toFixed(4):'—'}</span>`;
        // sub texts with formula results
        if(this.z1!==null) document.getElementById('sub-z1').textContent = `${this.weights.w11.toFixed(2)}·${this.x1} + ${this.weights.w12.toFixed(2)}·${this.x2} + ${this.weights.b1.toFixed(2)} = ${this.z1.toFixed(2)}`;
        if(this.a1!==null) document.getElementById('sub-a1').textContent = `σ(${this.z1.toFixed(2)}) = ${this.a1.toFixed(4)}  (σ′=${this.sig1!==null?this.sig1.toFixed(3):'—'})`;
        if(this.z2!==null) document.getElementById('sub-z2').textContent = `${this.weights.w21.toFixed(2)}·${this.x1} + ${this.weights.w22.toFixed(2)}·${this.x2} + ${this.weights.b2.toFixed(2)} = ${this.z2.toFixed(2)}`;
        if(this.a2!==null) document.getElementById('sub-a2').textContent = `σ(${this.z2.toFixed(2)}) = ${this.a2.toFixed(4)}  (σ′=${this.sig2!==null?this.sig2.toFixed(3):'—'})`;
        if(this.yHat!==null) document.getElementById('sub-yhat').textContent = `${this.weights.wo1.toFixed(2)}·${this.a1.toFixed(2)} + ${this.weights.wo2.toFixed(2)}·${this.a2.toFixed(2)} + ${this.weights.b0.toFixed(2)} = ${this.yHat.toFixed(4)}`;
        if(this.loss!==null) document.getElementById('sub-loss').textContent = `½(${this.yHat.toFixed(2)}−${this.yTrue.toFixed(2)})² = ${this.loss.toFixed(4)}`;

        // card active states
        const setActive=(id, on, backward=false)=>{
            const el=document.getElementById(id);
            el.classList.remove('active','backward-active');
            if(on) el.classList.add(backward?'backward-active':'active');
        };
        // reset then set based on stepIdx
        ['card-z1','card-a1','card-z2','card-a2','card-yhat','card-loss'].forEach(id=> setActive(id,false));
        if(this.stepIdx===1) setActive('card-z1',true);
        else if(this.stepIdx===2) setActive('card-a1',true);
        else if(this.stepIdx===3) setActive('card-z2',true);
        else if(this.stepIdx===4) setActive('card-a2',true);
        else if(this.stepIdx===5) setActive('card-yhat',true);
        else if(this.stepIdx>=6 && this.stepIdx<=7) setActive('card-loss',true);
        else if(this.stepIdx>=8) setActive('card-loss',true,true);
    }

    renderGradTable(){
        const tbody=document.getElementById('gradBody');
        tbody.innerHTML='';
        const rows=[
            {w:'w₁₁', val:this.weights.w11, grad:this.d_w11, isHl:this.stepIdx===11},
            {w:'w₁₂', val:this.weights.w12, grad:this.d_w12, isHl:this.stepIdx===11},
            {w:'b₁', val:this.weights.b1, grad:this.d_b1, isHl:this.stepIdx===11},
            {w:'w₂₁', val:this.weights.w21, grad:this.d_w21, isHl:this.stepIdx===13},
            {w:'w₂₂', val:this.weights.w22, grad:this.d_w22, isHl:this.stepIdx===13},
            {w:'b₂', val:this.weights.b2, grad:this.d_b2, isHl:this.stepIdx===13},
            {w:'wo₁', val:this.weights.wo1, grad:this.d_wo1, isHl:this.stepIdx===8},
            {w:'wo₂', val:this.weights.wo2, grad:this.d_wo2, isHl:this.stepIdx===8},
            {w:'b₀', val:this.weights.b0, grad:this.d_b0, isHl:this.stepIdx===8},
        ];
        rows.forEach(r=>{
            const tr=document.createElement('tr');
            if(r.isHl) tr.className = r.w.startsWith('w') && r.w.length===3 ? 'backward-hl' : 'highlight';
            // highlight also overall backward phase
            const gradStr = r.grad===null ? '—' : r.grad.toFixed(4);
            const gradClass = r.grad===null?'': (r.grad>0?'pos':'neg');
            const newVal = r.grad===null ? '—' : (r.val - this.lr * r.grad).toFixed(4);
            tr.innerHTML = `<td class="wname">${r.w}</td><td>${r.val.toFixed(4)}</td><td class="${gradClass}">${gradStr}</td><td>${newVal}</td>`;
            tbody.appendChild(tr);
        });
    }

    updatePhase(badge, desc, cls){
        const b=document.getElementById('phaseBadge');
        const d=document.getElementById('phaseDesc');
        b.textContent=badge; b.className='phase-badge '+cls;
        d.textContent=desc;
    }

    updateFormula(html, kind){
        document.getElementById('formulaContent').innerHTML=html;
    }

    updateInfo(){
        const chain = this.stepIdx<=5 ? 'x → z → a → ŷ → L (forward)' : this.stepIdx<=8 ? 'L → δ → wo (backward output)' : 'δ → σ′ → w (backward hidden)';
        this.updateInfoBox('infoChain', chain);
        const analogies=[
            'Ingredients on counter (x₁,x₂)',
            'Cook 1 mixes: w₁₁·x₁ + w₁₂·x₂ + b₁',
            'Cook 1 filters through σ → a₁',
            'Cook 2 mixes: w₂₁·x₁ + w₂₂·x₂ + b₂',
            'Cook 2 filters → a₂',
            'Head chef plates: wo₁a₁+wo₂a₂+b₀ → ŷ',
            'Taster: L=½(ŷ−y)², reports error',
            'Taster blame δ = ŷ−y sent to chef',
            'Chef gradients: δ·a₁ , δ·a₂',
            'Chef sends blame₁=δ·wo₁ to cook 1',
            'Cook 1: δ₁=blame₁·σ′(z₁)',
            'Cook 1 updates: Δw₁₁=δ₁·x₁, Δw₁₂=δ₁·x₂',
            'Chef sends blame₂=δ·wo₂ → δ₂=blame₂·σ′(z₂)',
            'Cook 2 updates: Δw₂₁=δ₂·x₁, Δw₂₂=δ₂·x₂',
            'All weights stepped: w ← w − η·∂L/∂w. Done!',
        ];
        document.getElementById('infoAnalogy').textContent = analogies[this.stepIdx] || '—';
        const learn = this.isFinished ? `Updated 9 weights (η=${this.lr})` : this.stepIdx<6 ? 'No learning yet — just computing' : `Error δ=${this.delta!==null?this.delta.toFixed(3):'—'} propagating`;
        this.updateInfoBox('infoLearn', learn);
    }

    // ---- step handler ----
    step(){
        if(this.isFinished) return;
        this.parseInputs(); // keep in sync if user edits before step
        this.stepIdx++;
        if(this.stepIdx>this.totalSteps){
            this.finishVisualization();
            return;
        }
        switch(this.stepIdx){
            case 1: this.doZ1(); break;
            case 2: this.doA1(); break;
            case 3: this.doZ2(); break;
            case 4: this.doA2(); break;
            case 5: this.doYhat(); break;
            case 6: this.doLoss(); break;
            case 7: this.doDelta(); break;
            case 8: this.doGradWo(); break;
            case 9: this.doBlame1(); break;
            case 10: this.doDelta1(); break;
            case 11: this.doGradW1(); break;
            case 12: this.doBlame2Delta2(); break;
            case 13: this.doGradW2(); break;
            case 14: this.doUpdate(); break;
        }
        this.updateInfo();
        this.updateInfoBox('infoStep', `${this.stepIdx} / ${this.totalSteps}`);
        this.renderGradTable();
        this.updateValues();
    }

    doZ1(){
        this.z1 = this.weights.w11*this.x1 + this.weights.w12*this.x2 + this.weights.b1;
        this.renderNetwork({h1:true, w11:true, w12:true, b1:true});
        this.highlightCode(1);
        this.updatePhase('Forward · h₁','Computing z₁ = w₁₁x₁ + w₁₂x₂ + b₁','forward');
        this.updateFormula(`<span class="hl">z₁</span> = ${this.weights.w11.toFixed(2)}·${this.x1} + ${this.weights.w12.toFixed(2)}·(${this.x2}) + ${this.weights.b1.toFixed(2)} = <span class="hl">${this.z1.toFixed(4)}</span>`, 'forward');
        this.updateStatus(`Forward: even with random weights, dot product gives a distinct projection z₁=${this.z1.toFixed(2)}. Next, σ(z₁).`);
    }
    doA1(){
        this.a1=this.sigmoid(this.z1); this.sig1=this.a1*(1-this.a1);
        this.renderNetwork({a1:true, sig1:true, h1:true});
        this.highlightCode(2);
        this.updatePhase('Forward · h₁','Activation a₁ = σ(z₁) = 1/(1+e^{-z₁})','forward');
        this.updateFormula(`<span class="hl">a₁ = σ(${this.z1.toFixed(2)})</span> = 1/(1+e<sup>−${this.z1.toFixed(2)}</sup>) = <span class="hl">${this.a1.toFixed(4)}</span> &nbsp; <span class="muted">σ′=${this.sig1.toFixed(4)}</span>`, 'forward');
        this.updateStatus(`Hidden neuron 1 output a₁=${this.a1.toFixed(4)}. The sigmoid squashes z₁ into (0,1) — a "filter" with slope σ′=${this.sig1.toFixed(3)}.`);
    }
    doZ2(){
        this.z2 = this.weights.w21*this.x1 + this.weights.w22*this.x2 + this.weights.b2;
        this.renderNetwork({h2:true, w21:true, w22:true, b2:true});
        this.highlightCode(3);
        this.updatePhase('Forward · h₂','Computing z₂ = w₂₁x₁ + w₂₂x₂ + b₂','forward');
        this.updateFormula(`<span class="hl">z₂</span> = ${this.weights.w21.toFixed(2)}·${this.x1} + ${this.weights.w22.toFixed(2)}·(${this.x2}) + ${this.weights.b2.toFixed(2)} = <span class="hl">${this.z2.toFixed(4)}</span> <span class="muted">— same x, different weights → different projection</span>`, 'forward');
        this.updateStatus(`Same inputs x=[${this.x1},${this.x2}], but w₂=[${this.weights.w21},${this.weights.w22}] gives z₂=${this.z2.toFixed(2)} ≠ z₁. That's how neurons specialize.`);
    }
    doA2(){
        this.a2=this.sigmoid(this.z2); this.sig2=this.a2*(1-this.a2);
        this.renderNetwork({a2:true, sig2:true, h2:true});
        this.highlightCode(4);
        this.updatePhase('Forward · h₂','Activation a₂ = σ(z₂)','forward');
        this.updateFormula(`<span class="hl">a₂ = σ(${this.z2.toFixed(2)})</span> = <span class="hl">${this.a2.toFixed(4)}</span> &nbsp; <span class="muted">σ′=${this.sig2.toFixed(4)}</span>`, 'forward');
        this.updateStatus(`a₂=${this.a2.toFixed(4)} (σ′=${this.sig2.toFixed(3)}). Two hidden activations are different numbers — head chef will mix them.`);
    }
    doYhat(){
        this.yHat = this.weights.wo1*this.a1 + this.weights.wo2*this.a2 + this.weights.b0;
        this.renderNetwork({out:true, wo1:true, wo2:true, b0:true, a1:true, a2:true});
        this.highlightCode(5);
        this.updatePhase('Forward · output','ŷ = wo₁a₁ + wo₂a₂ + b₀ (linear)','forward');
        this.updateFormula(`<span class="hl">ŷ</span> = ${this.weights.wo1.toFixed(2)}·${this.a1.toFixed(4)} + ${this.weights.wo2.toFixed(2)}·${this.a2.toFixed(4)} + ${this.weights.b0.toFixed(2)} = <span class="hl">${this.yHat.toFixed(4)}</span>`, 'forward');
        this.updateStatus(`Output ŷ=${this.yHat.toFixed(4)}. Forward pass is just nested functions: x → z → a → ŷ.`);
    }
    doLoss(){
        this.loss = 0.5 * Math.pow(this.yHat - this.yTrue, 2);
        this.renderNetwork({out:true});
        this.highlightCode(6);
        this.updatePhase('Loss','L = ½(ŷ − y)²','loss');
        this.updateFormula(`<span class="hl3">L</span> = ½(${this.yHat.toFixed(4)} − ${this.yTrue.toFixed(2)})² = <span class="hl3">${this.loss.toFixed(4)}</span> &nbsp; <span class="muted">error = ${(this.yHat - this.yTrue).toFixed(4)}</span>`, 'loss');
        this.updateStatus(`Taster says: target y=${this.yTrue}, we predicted ${this.yHat.toFixed(4)} → error ${ (this.yHat - this.yTrue).toFixed(4)} → loss ${this.loss.toFixed(4)}. This scalar will be our blame source.`);
    }
    doDelta(){
        this.delta = this.yHat - this.yTrue;
        this.renderNetwork({out:true});
        this.highlightCode(8);
        this.updatePhase('Backward · output','δ = ∂L/∂ŷ = ŷ − y','backward');
        this.updateFormula(`<span class="hl2">δ = ∂L/∂ŷ</span> = ŷ − y = ${this.yHat.toFixed(4)} − ${this.yTrue.toFixed(2)} = <span class="hl2">${this.delta.toFixed(4)}</span> &nbsp; <span class="muted">single blame message</span>`, 'backward');
        this.updateStatus(`Backprop starts. δ=${this.delta.toFixed(4)} is the "how salty?" signal. Every weight downstream will multiply this number.`);
    }
    doGradWo(){
        this.d_wo1 = this.delta * this.a1;
        this.d_wo2 = this.delta * this.a2;
        this.d_b0 = this.delta;
        this.renderNetwork({out:true, wo1:true, wo2:true, b0:true, backward:true});
        this.highlightCode(9);
        this.updatePhase('Backward · output','∂L/∂wo = δ · a  (downstream × upstream)','backward');
        this.updateFormula(`<span class="hl2">∂L/∂wo₁ = δ·a₁</span> = ${this.delta.toFixed(4)}·${this.a1.toFixed(4)} = <span class="hl2">${this.d_wo1.toFixed(4)}</span> &nbsp; | &nbsp; <span class="hl2">∂L/∂wo₂ = δ·a₂ = ${this.d_wo2.toFixed(4)}</span>`, 'backward');
        this.updateStatus(`Output weights get distinct gradients proportional to their hidden activation: ∂L/∂wo₁=${this.d_wo1.toFixed(4)}, ∂L/∂wo₂=${this.d_wo2.toFixed(4)} (× η will move them).`);
    }
    doBlame1(){
        this.blame1 = this.delta * this.weights.wo1;
        this.renderNetwork({out:true, a1:true, h1:true, wo1:true, backward:true});
        this.highlightCode(10);
        this.updatePhase('Backward · hidden 1','blame₁ = δ · wo₁','backward');
        this.updateFormula(`<span class="hl2">blame₁</span> = δ·wo₁ = ${this.delta.toFixed(4)}·${this.weights.wo1.toFixed(2)} = <span class="hl2">${this.blame1.toFixed(4)}</span> <span class="muted">— how much h₁ contributed to error</span>`, 'backward');
        this.updateStatus(`Chef says: "I used ${this.weights.wo1} portion of cook-1's sauce → pass blame₁=δ·wo₁=${this.blame1.toFixed(4)} back to cook 1."`);
    }
    doDelta1(){
        this.delta1 = this.blame1 * this.sig1;
        this.renderNetwork({h1:true, a1:true, sig1:true, backward:true});
        this.highlightCode(10);
        this.updatePhase('Backward · hidden 1','δ₁ = blame₁ · σ′(z₁)  with σ′=a₁(1−a₁)','backward');
        this.updateFormula(`σ′(z₁)=a₁(1−a₁)=${this.sig1.toFixed(4)} → <span class="hl2">δ₁ = blame₁·σ′</span> = ${this.blame1.toFixed(4)}·${this.sig1.toFixed(4)} = <span class="hl2">${this.delta1.toFixed(4)}</span>`, 'backward');
        this.updateStatus(`Sigmoid slope σ′(${this.z1.toFixed(2)})=${this.sig1.toFixed(4)} dampens blame. Local signal δ₁=${this.delta1.toFixed(4)} now scales with inputs.`);
    }
    doGradW1(){
        this.d_w11 = this.delta1 * this.x1;
        this.d_w12 = this.delta1 * this.x2;
        this.d_b1 = this.delta1;
        this.renderNetwork({h1:true, w11:true, w12:true, b1:true, backward:true});
        this.highlightCode(11);
        this.updatePhase('Backward · hidden 1','∂L/∂w₁ = δ₁ · x','backward');
        this.updateFormula(`<span class="hl2">∂L/∂w₁₁ = δ₁·x₁</span> = ${this.delta1.toFixed(4)}·${this.x1} = <span class="hl2">${this.d_w11.toFixed(4)}</span> &nbsp; | &nbsp; <span class="hl2">∂L/∂w₁₂ = δ₁·x₂ = ${this.d_w12.toFixed(4)}</span>`, 'backward');
        this.updateStatus(`Answer to "same features puzzle": both hidden neurons see same x, but w₁ gradients use δ₁=${this.delta1.toFixed(4)} while w₂ will use different δ₂. So they update differently!`);
    }
    doBlame2Delta2(){
        this.blame2 = this.delta * this.weights.wo2;
        this.delta2 = this.blame2 * this.sig2;
        this.renderNetwork({h2:true, a2:true, wo2:true, sig2:true, backward:true});
        this.highlightCode(12);
        this.updatePhase('Backward · hidden 2','blame₂ = δ·wo₂ → δ₂ = blame₂·σ′(z₂)','backward');
        this.updateFormula(`<span class="hl2">blame₂</span>=${this.delta.toFixed(4)}·${this.weights.wo2.toFixed(2)}=<span class="hl2">${this.blame2.toFixed(4)}</span> → <span class="hl2">δ₂</span>=${this.blame2.toFixed(4)}·${this.sig2.toFixed(4)}=<span class="hl2">${this.delta2.toFixed(4)}</span>`, 'backward');
        this.updateStatus(`Cook 2 gets opposite blame: blame₂=${this.blame2.toFixed(4)} (negative wo₂) → δ₂=${this.delta2.toFixed(4)}. Different δ → different updates.`);
    }
    doGradW2(){
        this.d_w21 = this.delta2 * this.x1;
        this.d_w22 = this.delta2 * this.x2;
        this.d_b2 = this.delta2;
        this.renderNetwork({h2:true, w21:true, w22:true, b2:true, backward:true});
        this.highlightCode(12);
        this.updatePhase('Backward · hidden 2','∂L/∂w₂ = δ₂ · x','backward');
        this.updateFormula(`<span class="hl2">∂L/∂w₂₁ = δ₂·x₁</span>=${this.delta2.toFixed(4)}·${this.x1}=<span class="hl2">${this.d_w21.toFixed(4)}</span> &nbsp; | &nbsp; <span class="hl2">∂L/∂w₂₂=δ₂·x₂=${this.d_w22.toFixed(4)}</span>`, 'backward');
        this.updateStatus(`Hidden 2 gradients: dw₂₁=${this.d_w21.toFixed(4)}, dw₂₂=${this.d_w22.toFixed(4)}. Compare to dw₁₁=${this.d_w11.toFixed(4)} — same x, different blame!`);
    }
    doUpdate(){
        this.highlightCode(13);
        const newWeights = {
            w11: this.weights.w11 - this.lr*this.d_w11,
            w12: this.weights.w12 - this.lr*this.d_w12,
            b1: this.weights.b1 - this.lr*this.d_b1,
            w21: this.weights.w21 - this.lr*this.d_w21,
            w22: this.weights.w22 - this.lr*this.d_w22,
            b2: this.weights.b2 - this.lr*this.d_b2,
            wo1: this.weights.wo1 - this.lr*this.d_wo1,
            wo2: this.weights.wo2 - this.lr*this.d_wo2,
            b0: this.weights.b0 - this.lr*this.d_b0,
        };
        // compute new forward quickly to show improvement
        const sig=(z)=>1/(1+Math.exp(-z));
        const z1n=newWeights.w11*this.x1 + newWeights.w12*this.x2 + newWeights.b1;
        const a1n=sig(z1n);
        const z2n=newWeights.w21*this.x1 + newWeights.w22*this.x2 + newWeights.b2;
        const a2n=sig(z2n);
        const yHatN=newWeights.wo1*a1n + newWeights.wo2*a2n + newWeights.b0;
        const lossN=0.5*Math.pow(yHatN - this.yTrue,2);
        this.updatePhase('Done — updated!','w ← w − η·∂L/∂w (η='+this.lr+')','done');
        this.updateFormula(`<span class="hl3">Updated</span>: ŷ ${this.yHat.toFixed(4)}→${yHatN.toFixed(4)} &nbsp; L ${this.loss.toFixed(4)}→${lossN.toFixed(4)} <span class="muted">ΔL=${(lossN-this.loss).toFixed(4)}</span>`, 'done');
        this.updateStatus(`After one SGD step (η=${this.lr}): loss ${this.loss.toFixed(4)} → ${lossN.toFixed(4)}. Every weight moved by its own local product — no global chooser, just chain rule.`, 'success');
        // apply
        this.weights=newWeights;
        this.renderNetwork({h1:true,h2:true,a1:true,a2:true,out:true});
        // show new values in grad table new col already reflects
        this.finishVisualization(yHatN, lossN);
    }

    finishVisualization(newYhat, newLoss){
        this.isFinished=true;
        if(this.isPlaying) this.pause();
        // keep stepIdx at total
    }
}

const visualizer = new NNVisualizer();
window.onload = ()=>{
    visualizer.bindControls();
    visualizer.init();
    document.getElementById('randomBtn').addEventListener('click', ()=> visualizer.randomize());
    // live input update on reset? also re-init on change if not playing?
    ['x1Input','x2Input','yTrueInput','lrInput'].forEach(id=>{
        document.getElementById(id).addEventListener('change', ()=>{
            // keep current weights if user just changes inputs? treat as init with preserved weights if already computed partially? For simplicity re-init with same weights
            visualizer._keepWeights=true;
            visualizer.init();
        });
    });
};
