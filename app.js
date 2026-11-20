// поиск ссылок на элементы страницы по id
const postsUrl = 'https://jsonplaceholder.typicode.com/posts';
const postsList = document.querySelector('#posts-list');
const loadButton = document.querySelector('#load-button');
const postForm = document.querySelector('#post-form');
const titleInput = document.querySelector('#title');
const bodyInput = document.querySelector('#body');
const createButton = document.querySelector('#create-button');
const messages = document.querySelector('#messages');

// вывод сообщения с соответствующим классом
function showMessage(text, type = '') {
    messages.textContent = text;
    messages.className = `messages ${type}`.trim();
}

// создание элемента для публикации 
function createPostCard(post, showId = false) {
    const card = document.createElement('article');
    card.className = 'post-card';

    const title = document.createElement('h3');
    title.textContent = post.title;

    const body = document.createElement('p');
    body.textContent = post.body;

    card.append(title, body);

    if (showId) {
        const id = document.createElement('p');
        id.className = 'post-id';
        id.textContent = `ID: ${post.id}`;
        card.append(id);
    }

    return card;
}

// загрузка публикаций 
// 
loadButton.addEventListener('click', async () => {
    loadButton.disabled = true;
    showMessage('Загрузка публикаций...');

    try {
        // отправка get-запроса
        const response = await fetch(`${postsUrl}?_limit=5`);

        if (!response.ok) {
            throw new Error(`Не удалось загрузить публикации. Ошибка HTTP: ${response.status}.`);
        }

        // разбирает тело ответа из JSON в JavaScript-массив объектов
        const posts = await response.json();
        // posts.map(...) превращает каждую запись в DOM-карточку, а replaceChildren(...) заменяет содержимое списка этими карточками
        postsList.replaceChildren(...posts.map((post) => createPostCard(post)));
        showMessage(`Загружено публикаций: ${posts.length}.`, 'success');
    // ловит HTTP-ошибки и сетевые сбои
    } catch (error) {
        postsList.replaceChildren();
        showMessage(`Ошибка загрузки: ${error.message} Проверьте соединение и попробуйте снова.`, 'error');
    } finally {
        loadButton.disabled = false;
    }
});

// создание публикации
postForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    // чтение полей
    const title = titleInput.value.trim();
    const body = bodyInput.value.trim();

    if (!title || !body) {
        showMessage('Заполните заголовок и текст. Поля не должны быть пустыми или содержать только пробелы.', 'error');
        return;
    }

    createButton.disabled = true;
    showMessage('Отправка публикации...');

    // отправка post-запроса
    try {
        const response = await fetch(postsUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ title, body, userId: 1 })
        });

        if (!response.ok) {
            throw new Error(`Сервер вернул ошибку HTTP: ${response.status}.`);
        }

        const createdPost = await response.json();
        postsList.querySelector('.empty-state')?.remove();
        postsList.prepend(createPostCard(createdPost, true));
        showMessage(`Публикация «${createdPost.title}» успешно создана. ID: ${createdPost.id}.`, 'success');
        postForm.reset();
    } catch (error) {
        showMessage(`Ошибка отправки: ${error.message} Проверьте соединение и попробуйте снова.`, 'error');
    } finally {
        createButton.disabled = false;
    }
});
