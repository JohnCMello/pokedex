(function () {
  const $backButton = document.querySelector('#backButton');
  const $prevButton = document.querySelector('#prevButton');
  const $nextButton = document.querySelector('#nextButton');
  const $pokemonDetail = document.querySelector('#pokemonDetail');
  const $pokemonInfo = document.querySelector('#pokemonInfoContainer');
  const $pokemonStats = document.querySelector('#pokemonStatsContainer');
  const $pokemonAbilities = document.querySelector(
    '#pokemonAbilitiesContainer'
  );

  const queryParams = new URLSearchParams(window.location.search);
  const pokemonId = queryParams.get('id');

  async function fetchSinglePokemon() {
    const URL = `https://pokeapi.co/api/v2/pokemon/${pokemonId}`;
    try {
      const response = await fetch(URL);
      const data = await response.json();
      //create a  function to set the page title
      document.title = `Pokemon Details: ${
        data.name.charAt(0).toUpperCase() + data.name.slice(1)
      }`;
      return data;
    } catch (error) {
      console.error('Error fetching Pokemon data:', error);
    }
  }

  function updatePokemonId(newId) {
    const url = window.location.href.split('?')[0] + `?id=${newId}`;
    window.location.href = url;
  }

  function createPokemonInfo(pokemonDetails) {
    const { name, id, sprites, types } = pokemonDetails;
    $pokemonDetail.classList.add(`single--${types[0].type.name}`);
    console.log($pokemonDetail);
    return `
        <figure>
          <img
            class="pokemonImage"
            src="${sprites.other['official-artwork'].front_default}"
            alt=""
          />
        </figure>
        <div class="pokemonNameTypeContainer">
          <div class="pokemonNameContainer">
            <span class="pokemonId">#${Number(id)
              .toString()
              .padStart(3, '0')}</span>
            <span class="pokemonName">${name}</span>
          </div>
          <div class="pokemonTypesContainer">
           ${types
             .map(
               (type) =>
                 `<span class="pokemonType ${type.type.name}">${type.type.name}</span>`
             )
             .join('')}
          </div>
        </div>
      `;
  }

  function createPokemonStats(pokemonDetails) {
    const { stats } = pokemonDetails;
    return stats
      .map((stat) => {
        return `
          <div class="statsRow">
            <span class="statLabel">${stat.stat.name}</span>
            <div class="statBar">
              <div class="statBarBg" style="width: ${stat.base_stat / 2}%">
                <span class="statValue">${stat.base_stat}</span>
              </div>
            </div>
          </div>
      `;
      })
      .join('');
  }

  async function createPokemonAbilities(pokemonDetail) {
    const { abilities } = pokemonDetail;

    const fetchAbilitiesText = async (ability) => {
      try {
        const response = await fetch(ability.ability.url);
        const data = await response.json();
        return data;
      } catch (error) {
        console.log(error);
        return null;
      }
    };

    const abilitiesData = await Promise.all(abilities.map(fetchAbilitiesText));

    const pokemonsAbilities = abilitiesData
      .map((abilityData, index) => {
        if (!abilityData) return;
        return `
        <div class="ability">
          <span class="abilityName">${abilityData.name}</span>
          <span class="abilityShortEffect">
            ${
              abilityData.flavor_text_entries.filter(
                (item) => item.language.name === 'en'
              )[0].flavor_text
            }
          </span>
          <p class="abilityEffect">
         ${
           abilityData.effect_entries.filter(
             (item) => item.language.name === 'en'
           )[0].effect
         }
            </p>
          </div>
      `;
      })
      .join('');

    return pokemonsAbilities;
  }

  async function displaySinglePokemonDetails() {
    const pokemonDetail = await fetchSinglePokemon();
    const pokemonInfo = createPokemonInfo(pokemonDetail);
    const pokemonStats = createPokemonStats(pokemonDetail);
    const pokemonAbilities = await createPokemonAbilities(pokemonDetail);

    $pokemonInfo.innerHTML = pokemonInfo;
    $pokemonStats.innerHTML = pokemonStats;
    $pokemonAbilities.innerHTML = pokemonAbilities;
  }

  function closestSmallerMultiplierOfSix(number) {
    return Math.floor(number / 6) * 6;
  }

  //Events
  $backButton.addEventListener('click', () => {
    if (window.location.href.includes('github.io'))
      return (window.location.href = `${window.location.origin}/pokedex/`);
    window.location.href = window.location.origin;
  });

  $prevButton.addEventListener('click', async () => {
    const newId = parseInt(pokemonId, 10) - 1;
    sessionStorage.setItem(
      'pokemonListOffset',
      closestSmallerMultiplierOfSix(newId)
    );
    if (newId > 0) {
      updatePokemonId(newId);
    }
  });

  $nextButton.addEventListener('click', async () => {
    const newId = parseInt(pokemonId, 10) + 1;
    sessionStorage.setItem(
      'pokemonListOffset',
      closestSmallerMultiplierOfSix(newId)
    );
    updatePokemonId(newId);
  });

  displaySinglePokemonDetails();
})();
