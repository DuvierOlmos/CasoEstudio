document.addEventListener('DOMContentLoaded', () => {
    const songForm = document.getElementById('songForm');
    const songIdInput = document.getElementById('songId');
    const titleInput = document.getElementById('title');
    const artistInput = document.getElementById('artist');
    const genreInput = document.getElementById('genre');
    const yearInput = document.getElementById('year');
    const songsTableBody = document.getElementById('songsTableBody');
    const formTitle = document.getElementById('formTitle');
    const saveSongBtn = document.getElementById('saveSongBtn');
    const cancelEditBtn = document.getElementById('cancelEditBtn');
    const searchBar = document.getElementById('searchBar');
    const clearSearchBtn = document.getElementById('clearSearchBtn');
    const noSongsMessage = document.getElementById('noSongsMessage');

    const LOCAL_STORAGE_KEY = 'globalSongsCatalog';
    let songs = []; // Array para almacenar las canciones

    // --- Funciones de Utilidad para Local Storage ---
    const getSongsFromLocalStorage = () => {
        const storedSongs = localStorage.getItem(LOCAL_STORAGE_KEY);
        return storedSongs ? JSON.parse(storedSongs) : [];
    };

    const saveSongsToLocalStorage = (songsArray) => {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(songsArray));
    };

    // --- RF4.1: Adición de Canciones ---
    const addSong = (newSong) => {
        newSong.id = Date.now().toString(); // Genera un ID único basado en timestamp
        songs.push(newSong);
        saveSongsToLocalStorage(songs);
        renderSongs();
        songForm.reset();
        showAlert('Canción añadida exitosamente!', 'success');
    };

    // --- RF4.2: Edición de Canciones ---
    const editSong = (updatedSong) => {
        const index = songs.findIndex(song => song.id === updatedSong.id);
        if (index !== -1) {
            songs[index] = updatedSong;
            saveSongsToLocalStorage(songs);
            renderSongs();
            songForm.reset();
            formTitle.textContent = 'Añadir Nueva Canción';
            saveSongBtn.innerHTML = '<i class="bi bi-plus-circle"></i> Añadir Canción';
            cancelEditBtn.style.display = 'none';
            showAlert('Canción actualizada exitosamente!', 'success');
        }
    };

    // --- RF4.3: Eliminación de Canciones ---
    const deleteSong = (id) => {
        if (confirm('¿Estás seguro de que quieres eliminar esta canción?')) {
            songs = songs.filter(song => song.id !== id);
            saveSongsToLocalStorage(songs);
            renderSongs();
            showAlert('Canción eliminada exitosamente!', 'danger');
        }
    };

    // --- RF4.4: Búsqueda de Canciones ---
    const filterSongs = (searchTerm) => {
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        return songs.filter(song =>
            song.title.toLowerCase().includes(lowerCaseSearchTerm) ||
            song.artist.toLowerCase().includes(lowerCaseSearchTerm) ||
            (song.genre && song.genre.toLowerCase().includes(lowerCaseSearchTerm))
        );
    };

    // --- Renderizado de la Tabla y Lógica de UI ---
    const renderSongs = () => {
        songsTableBody.innerHTML = '';
        const currentSearchTerm = searchBar.value.trim();
        const songsToDisplay = currentSearchTerm ? filterSongs(currentSearchTerm) : songs;

        if (songsToDisplay.length === 0) {
            songsTableBody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center">No hay canciones para mostrar.</td>
                </tr>
            `;
            noSongsMessage.style.display = currentSearchTerm && songs.length > 0 ? 'block' : 'none'; // Mostrar si hay búsqueda sin resultados
        } else {
            noSongsMessage.style.display = 'none';
            songsToDisplay.forEach(song => {
                const row = songsTableBody.insertRow();
                row.innerHTML = `
                    <td>${song.title}</td>
                    <td>${song.artist}</td>
                    <td>${song.genre || 'N/A'}</td>
                    <td>${song.year || 'N/A'}</td>
                    <td>
                        <button class="btn btn-sm btn-warning edit-btn me-2" data-id="${song.id}">
                            <i class="bi bi-pencil-square"></i> Editar
                        </button>
                        <button class="btn btn-sm btn-danger delete-btn" data-id="${song.id}">
                            <i class="bi bi-trash"></i> Eliminar
                        </button>
                    </td>
                `;
            });
        }
    };

    // --- Manejadores de Eventos ---

    songForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const song = {
            title: titleInput.value.trim(),
            artist: artistInput.value.trim(),
            genre: genreInput.value.trim(),
            year: yearInput.value ? parseInt(yearInput.value) : null
        };

        if (songIdInput.value) {
            song.id = songIdInput.value;
            editSong(song);
        } else {
            addSong(song);
        }
    });

    songsTableBody.addEventListener('click', (e) => {
        if (e.target.classList.contains('edit-btn') || e.target.closest('.edit-btn')) {
            const id = e.target.closest('.edit-btn').dataset.id;
            const songToEdit = songs.find(song => song.id === id);
            if (songToEdit) {
                songIdInput.value = songToEdit.id;
                titleInput.value = songToEdit.title;
                artistInput.value = songToEdit.artist;
                genreInput.value = songToEdit.genre || '';
                yearInput.value = songToEdit.year || '';

                formTitle.textContent = 'Editar Canción';
                saveSongBtn.innerHTML = '<i class="bi bi-save"></i> Guardar Cambios';
                cancelEditBtn.style.display = 'inline-block';
            }
        }

        if (e.target.classList.contains('delete-btn') || e.target.closest('.delete-btn')) {
            const id = e.target.closest('.delete-btn').dataset.id;
            deleteSong(id);
        }
    });

    cancelEditBtn.addEventListener('click', () => {
        songForm.reset();
        songIdInput.value = '';
        formTitle.textContent = 'Añadir Nueva Canción';
        saveSongBtn.innerHTML = '<i class="bi bi-plus-circle"></i> Añadir Canción';
        cancelEditBtn.style.display = 'none';
    });

    searchBar.addEventListener('input', () => {
        renderSongs(); // Vuelve a renderizar la tabla con los resultados de la búsqueda
    });

    clearSearchBtn.addEventListener('click', () => {
        searchBar.value = '';
        renderSongs();
    });

    // Función para mostrar alertas de Bootstrap
    const showAlert = (message, type) => {
        const alertPlaceholder = document.querySelector('.container');
        const wrapper = document.createElement('div');
        wrapper.innerHTML = `
            <div class="alert alert-${type} alert-dismissible fade show mt-3" role="alert">
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        `;
        alertPlaceholder.prepend(wrapper); // Añade la alerta al principio del contenedor
        // Opcional: Eliminar la alerta automáticamente después de un tiempo
        setTimeout(() => {
            wrapper.remove();
        }, 3000);
    };


    // Inicialización: Cargar canciones al cargar la página
    songs = getSongsFromLocalStorage();
    renderSongs();
});