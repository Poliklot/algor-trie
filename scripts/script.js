// Вспомогательные функции

/**
 * Возвращает рандомное целое число в интервале min-max.
 * @param {Number} min - Минимальное число интервала
 * @param {Number} max - Максимальное число интервала
 * @returns {Number}
 */
const getRandomInt = (min, max) => {
    return Math.floor(Math.random() * (max - min) + min);
};

// END Вспомогательные функции


const containerSelector = '.graph-container';
let lastGraph = null;
let lastTrie = null;
let lastTrueNodesIndexList = null;
let nowShowFinded = false;

const drawTrie = (trie) => {
    lastTrueNodesIndexList = null;
    nowShowFinded = false;
    const data = generateDataForDraw(trie);

    let graph = Viva.Graph.graph(),
    nodePositions = data.positions,
    graphics = Viva.Graph.View.svgGraphics(),
    layout = Viva.Graph.Layout.constant(graph),
    nodeSize = 24,
    renderer = Viva.Graph.View.renderer(graph, {
        graphics: graphics,
        layout : layout,
        container: document.querySelector(containerSelector)
    });
    
    let i, nodesCount = nodePositions.length;
    
    data.nodes.forEach(node => {
        graph.addNode(node.id, node.data);
    })
    
    data.links.forEach(link => {
        graph.addLink(link.from, link.to);
    })
    
    graphics.link(function(link){
        ui = Viva.Graph.svg('line')
            .attr('stroke', 'red')
            .attr('fill', 'red')
            .attr('id', `${link.fromId}-${link.toId}`);
        return ui;
    })
    
    graphics.node(function(node){
        const ui = Viva.Graph.svg('g')
           .attr('id', node.id),
           svgText = Viva.Graph.svg('text')
           .attr('y', '-4px')
           .attr('x', '0px')
           .attr('fill', 'red')
           .text(node.data),
           svgRect = Viva.Graph.svg('rect')
           .attr('width', 10)
           .attr('height', 10)
           .attr('fill', '#00d635');

       ui.append(svgText)
       ui.append(svgRect)
       return ui;
    })
    .placeNode(function(nodeUI, pos) {
        nodeUI.attr('transform', `translate(${pos.x - nodeSize / 4}, ${pos.y - nodeSize / 2})`);
    });
    
    layout.placeNode(function(node) {
        return nodePositions[node.id];
    });

    renderer.run();
    return graph;
}

const generateDataForDraw = (trie) => {
    let indexNode = 0;
    let dethDeviation = [0, 150, 70, 30, 15];

    const positions = [];
    const nodes = [];
    const links = [];
    
    nodes.push({id: 0, data: '*'});
    positions.push({x: 0, y: 0});

    const checkTree = (tree, deth = 0, deviation = 0, parentIndex = 0) => {
        const children = [];
        
        if (tree['0']) {
            nodes.push({id: indexNode + 1, data: '0'});
            links.push({from: parentIndex, to: indexNode + 1});
            positions.push({x: deviation - dethDeviation[deth + 1], y: (deth + 1) * 50});
            children.push({tree: tree['0'], deviation: deviation - dethDeviation[deth + 1], parentIndex: ++indexNode});
        }
        if (tree['1']) {
            nodes.push({id: indexNode + 1, data: '1'});
            links.push({from: parentIndex, to: indexNode + 1});
            positions.push({x: deviation + dethDeviation[deth + 1] , y: (deth + 1) * 50});
            children.push({tree: tree['1'], deviation: deviation + dethDeviation[deth + 1], parentIndex: ++indexNode});
        }
        if (children.length != 0) children.forEach(tree => checkTree(tree.tree, deth + 1, tree.deviation, tree.parentIndex));
    };
    
    checkTree(trie.trie);

    const maxCountSide = getMaxCountSide(trie);
    const maxCountDepth = getMaxCountDepth(trie);

    return {
        positions: positions,
        nodes: nodes,
        links: links
    };
}

const getMaxCountSide = (trie) => {
    let result = -1;
    trie.nodeList.forEach(node => {
        const nodeArray = node.split('');
        const leftCount = nodeArray.filter(x => x == '1').length;
        const rightCount = nodeArray.length - leftCount;
        const value = Math.abs(leftCount - rightCount)
        result = (value > result) ? value : result;
    })
    return result;
}

const getMaxCountDepth = (trie) => {

}

const clearGraph = (graph = lastGraph) => {
    graph.clear();
    document.querySelector(`${containerSelector} svg`)?.remove();
}

const getRandomNodeList = (deth, countNodes) => {
    const result = []
    
    for (let j = 0; j < countNodes; j++) {
        let nodeStr = '';
        
        for (let i = 0; i < getRandomInt(2, 5); i++) {
            nodeStr += Math.floor(Math.random() * 2);
        }
        result.push(nodeStr);
    }

    return result;
};

const showFindingProccesNode = () => {

}

const nodeList = ['0', '11', '00', '10', '01', '1011', '1010'];
lastGraph = drawTrie(lastTrie = new Trie(nodeList));



// - DOM - //

const showNotification = (text, mode) => {

}

document.querySelector('#buttonCreateRandomTrie')?.addEventListener('click', () => {
    clearGraph();
    lastGraph = drawTrie(lastTrie = new Trie(getRandomNodeList(4, 8)));
})

document.querySelector('#buttonFindTrie')?.addEventListener('click', () => {
    findEvent();
})

document.querySelector('#inputFindTrie').addEventListener('keydown', (e) => {
    if (e.code == 'Enter') findEvent();
})

const findEvent = () => {
    const strToFind = document.querySelector('#inputFindTrie').value;
    
    if ((strToFind.length < 1) || (strToFind.length > 100000)) {
        console.log('Некорректные данные');
    } else {
        if (lastTrie.hasNode(strToFind)) {
            console.log('Есть такое');
            let countCheck = 0;
            let indexNode = 0;
            const trueNodesIndexList = [0];

            const checkTree = (tree, isTrueTree = true) => {
                let wasSelected = false;
                const children = [];
                if (tree['0']) {
                    indexNode++;
                    if ((strToFind[countCheck] == '0') && isTrueTree) {
                        trueNodesIndexList.push(indexNode);
                        children.push({tree: tree['0'], isTrueTree: true});
                        countCheck++;
                        wasSelected = true;
                    } else {
                        children.push({tree: tree['0'], isTrueTree: false});
                    }
                }
                if (tree['1']) {
                    indexNode++;
                    if ((strToFind[countCheck] == '1') && isTrueTree && !wasSelected) {
                        trueNodesIndexList.push(indexNode);
                        children.push({tree: tree['1'], isTrueTree: true});
                        countCheck++;
                    } else {
                        children.push({tree: tree['1'], isTrueTree: false});
                    }
                }
                if (children.length != 0) children.forEach(tree => checkTree(tree.tree, tree.isTrueTree));
            };
            
            checkTree(lastTrie.trie);
            if (nowShowFinded) hideFinded();
            showFinded(lastTrueNodesIndexList = trueNodesIndexList);
            
        } else {
            console.log('Нет такого');
        }
    }
}

const showFinded = (trueNodesIndexList) => {
    nowShowFinded = true;
    const linesList = Array.from(document.querySelectorAll('svg g line'));
    const nodexList = Array.from(document.querySelectorAll('svg g'));
    const findedLinesList = [];
    const findedNodesList = [];
    let prevIndex = null;
    trueNodesIndexList.forEach(index => {
        findedNodesList.push(nodexList.find($node => $node.id === `${index}`));
        if (prevIndex !== null) {
            findedLinesList.push(linesList.find($line => $line.id == `${prevIndex}-${index}`));
        }
        prevIndex = index;
    })
    findedNodesList.forEach($node => {
        $node.querySelector('rect').setAttribute('fill', 'blue')
    })
    findedLinesList.forEach($link => {
        $link.setAttribute('stroke', 'blue')
    })

    setTimeout(() => {
        if (nowShowFinded) hideFinded();
    }, 3000)
}

const hideFinded = () => {
    nowShowFinded = false;
    const linesList = Array.from(document.querySelectorAll('svg g line'));
    const nodexList = Array.from(document.querySelectorAll('svg g'));
    const findedLinesList = [];
    const findedNodesList = [];
    let prevIndex = null;
    lastTrueNodesIndexList.forEach(index => {
        findedNodesList.push(nodexList.find($node => $node.id === `${index}`));
        if (prevIndex !== null) {
            findedLinesList.push(linesList.find($line => $line.id == `${prevIndex}-${index}`));
        }
        prevIndex = index;
    })
    findedNodesList.forEach($node => {
        $node.querySelector('rect').setAttribute('fill', '#00d635')
    })
    findedLinesList.forEach($link => {
        $link.setAttribute('stroke', 'red')
    })
}