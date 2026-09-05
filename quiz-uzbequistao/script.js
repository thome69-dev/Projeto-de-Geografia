const STORAGE_KEY = 'quiz-uz-opinioes';

document.addEventListener('DOMContentLoaded', () => {
  const formNome = document.getElementById('form-nome');
  if (formNome) {
    formNome.addEventListener('submit', (ev) => {
      ev.preventDefault();
      const nome = document.getElementById('nome').value.trim() || 'Visitante';
      window.location.href = `quiz.html?nome=${encodeURIComponent(nome)}`;
    });
  }

  const formQuiz = document.getElementById('form-quiz');
  if (formQuiz) {
    const params = new URLSearchParams(window.location.search);
    const nome = params.get('nome') || 'Visitante';
    const saudacao = document.getElementById('saudacao');
    if (saudacao) {
      saudacao.replaceChildren('Olá, ', Object.assign(document.createElement('span'), { className: 'accent', textContent: nome }), '!');
    }

    const questions = Array.from(document.querySelectorAll('.question'));
    let current = 0;
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const submitBtn = document.getElementById('submitBtn');
    const progress = document.getElementById('progress');
    const contador = document.getElementById('contador');
    const aviso = document.getElementById('aviso');

    function selectedName(q) {
      const name = q.querySelector('input[type="radio"]')?.name;
      return name && document.querySelector(`input[name="${name}"]:checked`);
    }

    function showQuestion(index) {
      questions.forEach((q, i) => q.classList.toggle('is-on', i === index));
      prevBtn.disabled = index === 0;
      const last = index === questions.length - 1;
      nextBtn.hidden = last;
      submitBtn.hidden = !last;
      if (progress) progress.style.width = `${Math.round(((index + 1) / questions.length) * 100)}%`;
      if (contador) contador.textContent = `${index + 1} / ${questions.length}`;
      aviso.hidden = true;
    }

    showQuestion(current);

    questions.forEach((q, i) => {
      q.querySelectorAll('input[type="radio"]').forEach((input) => {
        input.addEventListener('change', () => {
          aviso.hidden = true;
          if (i < questions.length - 1) {
            current = i + 1;
            showQuestion(current);
          }
        });
      });
    });

    prevBtn.addEventListener('click', () => {
      if (current > 0) {
        current -= 1;
        showQuestion(current);
      }
    });

    nextBtn.addEventListener('click', () => {
      if (!selectedName(questions[current])) {
        aviso.hidden = false;
        return;
      }
      if (current < questions.length - 1) {
        current += 1;
        showQuestion(current);
      }
    });

    formQuiz.addEventListener('submit', (ev) => {
      ev.preventDefault();
      const unanswered = questions.find((q) => !selectedName(q));
      if (unanswered) {
        aviso.hidden = false;
        return;
      }

      const respostasCorretas = { q1: 'b', q2: 'b', q3: 'b', q4: 'a', q5: 'b' };
      let score = 0;
      for (const key of Object.keys(respostasCorretas)) {
        const sel = document.querySelector(`input[name="${key}"]:checked`);
        if (sel && sel.value === respostasCorretas[key]) score += 1;
      }

      window.location.href = `resultado.html?score=${score}&nome=${encodeURIComponent(nome)}`;
    });
  }

  const mensagemResultado = document.getElementById('mensagem-resultado');
  const scoreBadge = document.getElementById('score-badge');
  if (mensagemResultado && scoreBadge) {
    const params = new URLSearchParams(window.location.search);
    const score = parseInt(params.get('score'), 10);
    const nome = params.get('nome') || 'Visitante';
    const opiniaoLink = document.getElementById('opiniaoLink');
    if (opiniaoLink) {
      opiniaoLink.href = `opiniao.html?nome=${encodeURIComponent(nome)}`;
    }

    if (!Number.isInteger(score)) {
      mensagemResultado.textContent = `${nome}, nenhum resultado encontrado.`;
      scoreBadge.textContent = '0/5';
    } else {
      scoreBadge.textContent = `${score}/5`;
      if (score === 5) {
        mensagemResultado.textContent = `${nome}, você acertou 5/5. Excelente trabalho!`;
      } else if (score >= 3) {
        mensagemResultado.textContent = `${nome}, você acertou ${score}/5. Muito bom — dá para melhorar.`;
      } else {
        mensagemResultado.textContent = `${nome}, você acertou ${score}/5. Continue estudando.`;
      }
    }

    document.getElementById('refazerBtn')?.addEventListener('click', () => {
      window.location.href = `quiz.html?nome=${encodeURIComponent(nome)}`;
    });
    document.getElementById('voltarInicioBtn')?.addEventListener('click', () => {
      window.location.href = 'index.html';
    });
  }

  const formOpiniao = document.getElementById('form-opiniao');
  if (formOpiniao) {
    const params = new URLSearchParams(window.location.search);
    const nome = params.get('nome') || 'Visitante';
    const aviso = document.getElementById('aviso-opiniao');

    formOpiniao.addEventListener('submit', (ev) => {
      ev.preventDefault();
      const escolha = formOpiniao.querySelector('input[name="opiniao"]:checked');
      if (!escolha) {
        aviso.hidden = false;
        return;
      }

      const data = readOpinioes();
      data.push({
        nome,
        opiniao: escolha.value,
        comentario: document.getElementById('comentario').value.trim(),
        quando: Date.now()
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      window.location.href = 'comentarios.html';
    });
  }

  const statsList = document.getElementById('stats-list');
  if (statsList) {
    const data = readOpinioes();
    const counts = {
      gostei: data.filter((d) => d.opiniao === 'gostei').length,
      mediano: data.filter((d) => d.opiniao === 'mediano').length,
      'nao-gostei': data.filter((d) => d.opiniao === 'nao-gostei').length
    };
    const total = data.length || 1;

    document.getElementById('count-gostei').textContent = String(counts.gostei);
    document.getElementById('count-mediano').textContent = String(counts.mediano);
    document.getElementById('count-nao-gostei').textContent = String(counts['nao-gostei']);
    document.getElementById('bar-gostei').style.width = `${(counts.gostei / total) * 100}%`;
    document.getElementById('bar-mediano').style.width = `${(counts.mediano / total) * 100}%`;
    document.getElementById('bar-nao-gostei').style.width = `${(counts['nao-gostei'] / total) * 100}%`;

    const totalEl = document.getElementById('total-votos');
    totalEl.textContent = data.length
      ? `${data.length} pessoa${data.length === 1 ? '' : 's'} já opinou neste aparelho.`
      : 'Ainda ninguém votou neste aparelho.';

    const lista = document.getElementById('lista-comentarios');
    const escritos = data.filter((d) => d.comentario).reverse();
    if (!escritos.length) {
      lista.innerHTML = '<li class="empty">Nenhum comentário escrito ainda.</li>';
    } else {
      lista.replaceChildren(...escritos.map((item) => {
        const li = document.createElement('li');
        li.className = 'comment';
        const tag = document.createElement('span');
        tag.className = 'tag';
        tag.textContent = labelOpiniao(item.opiniao);
        const b = document.createElement('b');
        b.textContent = item.nome;
        const span = document.createElement('span');
        span.textContent = item.comentario;
        li.append(tag, b, span);
        return li;
      }));
    }
  }
});

function readOpinioes() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function labelOpiniao(value) {
  if (value === 'gostei') return 'Gostei';
  if (value === 'mediano') return 'Mediano';
  return 'Não gostei';
}
