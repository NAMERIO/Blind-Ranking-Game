document.addEventListener('DOMContentLoaded', () => {
    const categories = document.querySelectorAll('.category');
    const homeScreen = document.getElementById('home-screen');
    const gameScreen = document.getElementById('game-screen');
    const loadingMessage = document.getElementById('loading-message');
    const categoryTitle = document.getElementById('category-title');
    const quitButton = document.getElementById('quit-btn');
    const continueButton = document.getElementById('continue-btn');

    let currentCategory = "";
    let movies = [];
    let rankings = [null, null, null, null, null];
    let currentMovieIndex = 0;
    let askedMovies = [];

    categories.forEach((category) => {
        category.addEventListener('click', () => {
            const selectedCategory = category.dataset.category;
            currentCategory = selectedCategory;

            loadingMessage.style.display = 'block';

            setTimeout(() => {
                homeScreen.style.display = 'none';
                loadingMessage.style.display = 'none';
                gameScreen.style.display = 'block';

                categoryTitle.textContent = `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Ranking`;

                startGame(selectedCategory);
            }, 500);
        });
    });

    quitButton.addEventListener('click', () => {
        gameScreen.style.display = 'none';
        homeScreen.style.display = 'block';
        resetGame();
    });

    continueButton.addEventListener('click', () => {
        continueButton.style.display = 'none';
        resetGame();
        startGame(currentCategory);
    });

    function startGame(category) {
        fetchCategoryData(category);
    }

    function fetchCategoryData(category) {
        fetch(`/api/${category}`)
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`Failed to fetch data for category: ${category}`);
                }
                return response.json();
            })
            .then((data) => {
                movies = shuffleArray(data);
                currentMovieIndex = 0;
                askedMovies = [];

                if (movies.length === 0) {
                    showMessage("No items available for this category!", "error");
                    return;
                }

                displayNextMovie();
                setupRankingButtons();
            })
            .catch((err) => {
                console.error(err);
                showMessage("Failed to load data. Please try again later.", "error");
            });
    }

    function displayNextMovie() {
        if (currentMovieIndex >= 5) {
            showRankingsPopup();
            return;
        }

        const movie = movies[currentMovieIndex];

        const movieImage = document.getElementById('movie-image');
        const movieName = document.getElementById('movie-name');
        movieImage.src = movie.image || "";
        movieImage.alt = movie.name || "Movie";
        movieName.textContent = movie.name || "Unknown Movie";
    }

    function handleRankClick(event) {
        const rank = parseInt(event.target.dataset.rank);

        if (rankings[rank - 1]) {
            showMessage("This rank is already taken!", "error");
            return;
        }

        const movie = movies[currentMovieIndex];
        rankings[rank - 1] = movie.name;
        document.getElementById(`slot-${rank}`).textContent = movie.name;

        currentMovieIndex++;
        displayNextMovie();
    }

    function showRankingsPopup() {
        const popup = document.createElement('div');
        popup.className = 'rankings-popup';
        popup.innerHTML = `
            <div class="popup-content">
                <h2>Your Rankings</h2>
                <ol>
                    ${rankings.map((movie) => `<li>${movie}</li>`).join('')}
                </ol>
                <button id="play-again-btn">Play Again</button>
                <button id="quit-popup-btn">Quit</button>
            </div>
        `;
    
        document.body.appendChild(popup);
    
        document.getElementById('play-again-btn').addEventListener('click', () => {
            popup.remove();
            resetGame();
            startGame(currentCategory);
        });
    
        document.getElementById('quit-popup-btn').addEventListener('click', () => {
            popup.remove();
            resetGame();
            document.getElementById('game-screen').style.display = 'none';
            document.getElementById('home-screen').style.display = 'block';
        });
    }
    

    function setupRankingButtons() {
        const rankButtons = document.querySelectorAll('.rank-btn');
        rankButtons.forEach((button) => {
            button.removeEventListener('click', handleRankClick);
            button.addEventListener('click', handleRankClick);
        });
    }

    function resetGame() {
        rankings = [null, null, null, null, null];
        currentMovieIndex = 0;

        for (let i = 1; i <= 5; i++) {
            document.getElementById(`slot-${i}`).textContent = "";
        }
    }

    function showMessage(message, type) {
        const messageBox = document.getElementById('message-box');
        messageBox.innerText = message;

        if (type === "error") {
            messageBox.className = "message error";
        } else if (type === "success") {
            messageBox.className = "message success";
        }

        messageBox.style.display = "block";

        setTimeout(() => {
            messageBox.style.display = "none";
        }, 3000);
    }

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
});
