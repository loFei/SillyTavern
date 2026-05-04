import { getPreviewString, saveTtsProviderSettings } from './index.js';

export { GptSovitsV2Provider };

class GptSovitsV2Provider {
    //########//
    // Config //
    //########//

    settings;
    ready = false;
    voices = [];
    gpt_weights = [];
    sovits_weights = [];
    separator = '. ';
    audioElement = document.createElement('audio');

    /**
     * Perform any text processing before passing to TTS engine.
     * @param {string} text Input text
     * @returns {string} Processed text
     */
    processText(text) {
        return text;
    }

    audioFormats = ['wav', 'ogg', 'silk', 'mp3', 'flac'];

    languageLabels = {
        'Auto': 'auto',
    };

    langKey2LangCode = {
        'zh': 'zh-CN',
        'en': 'en-US',
        'ja': 'ja-JP',
        'ko': 'ko-KR',
    };


    defaultSettings = {
        provider_endpoint: 'http://localhost:9880',
        format: 'wav',
        lang: 'auto',
        streaming: false,
        text_lang: 'zh',
        prompt_lang: 'zh',
        gpt_weight: "",
        sovits_weight: "",
        batch_size: 1,
        fragment_interval: 0.3,
        speed_factor: 1.0,
        top_k: 5,
        top_p: 1,
        temperature: 1,
        repetition_penalty: 1.35,
    };

    get settingsHtml() {
        let html = `

        <label for="tts_endpoint">Provider Endpoint:</label>
        <input id="tts_endpoint" type="text" class="text_pole" maxlength="250" height="300" value="${this.defaultSettings.provider_endpoint}"/>
        <span>Use <a target="_blank" href="https://github.com/v3ucn/GPT-SoVITS-V2">GPT-SoVITS-V2</a>(Unofficial).</span><br/>
        <label for="text_lang">Text Lang(Inference text language):</label>
        <input id="text_lang" type="text" class="text_pole" maxlength="250" height="300" value="${this.defaultSettings.text_lang}"/>
        <label for="text_lang">Prompt Lang(Reference audio text language):</label>
        <input id="prompt_lang" type="text" class="text_pole" maxlength="250" height="300" value="${this.defaultSettings.prompt_lang}"/>
        <label>GPT Weight</label>
        <select id='gpt_weights_voice'>
        </select>
        <label>Sovits Weight</label>
        <select id='sovits_weights_voice'>
        </select>
        <div class="range-block">
            <div class="range-block-title justifyLeft">
                <label>Batch Size</label>
            </div>
            <div class="range-block-range-and-counter">
                <div class="range-block-range">
                    <input id='gpt_sovits_v2_batch_size' type="range" min="1" max="200" step="1" value="${this.defaultSettings.batch_size}"/>
                </div>
                <div class="range-block-counter">
                    <input type="number" min="1" max="200" step="1" data-for="gpt_sovits_v2_batch_size" id="gpt_sovits_v2_batch_size_counter">
                </div>
            </div>
        </div>
        <div class="range-block">
            <div class="range-block-title justifyLeft">
                <label>Fragment Interval</label>
            </div>
            <div class="range-block-range-and-counter">
                <div class="range-block-range">
                    <input id='gpt_sovits_v2_fragment_interval' type="range" min="0.01" max="1" step="0.01" value="${this.defaultSettings.fragment_interval}"/>
                </div>
                <div class="range-block-counter">
                    <input type="number" min="0.01" max="1" step="0.01" data-for="gpt_sovits_v2_fragment_interval" id="gpt_sovits_v2_fragment_interval_counter">
                </div>
            </div>
        </div>
        <div class="range-block">
            <div class="range-block-title justifyLeft">
                <label>Speed Factor</label>
            </div>
            <div class="range-block-range-and-counter">
                <div class="range-block-range">
                    <input id='gpt_sovits_v2_speed_factor' type="range" min="0.6" max="1.65" step="0.05" value="${this.defaultSettings.speed_factor}"/>
                </div>
                <div class="range-block-counter">
                    <input type="number" min="0.6" max="1.65" step="0.05" data-for="gpt_sovits_v2_speed_factor" id="gpt_sovits_v2_speed_factor_counter">
                </div>
            </div>
        </div>
        <div class="range-block">
            <div class="range-block-title justifyLeft">
                <label>Top K</label>
            </div>
            <div class="range-block-range-and-counter">
                <div class="range-block-range">
                    <input id='gpt_sovits_v2_top_k' type="range" min="1" max="100" step="1" value="${this.defaultSettings.top_k}"/>
                </div>
                <div class="range-block-counter">
                    <input type="number" min="1" max="100" step="1" data-for="gpt_sovits_v2_top_k" id="gpt_sovits_v2_top_k_counter">
                </div>
            </div>
        </div>
        <div class="range-block">
            <div class="range-block-title justifyLeft">
                <label>Top P</label>
            </div>
            <div class="range-block-range-and-counter">
                <div class="range-block-range">
                    <input id='gpt_sovits_v2_top_p' type="range" min="0" max="1" step="0.05" value="${this.defaultSettings.top_p}"/>
                </div>
                <div class="range-block-counter">
                    <input type="number" min="0" max="1" step="0.05" data-for="gpt_sovits_v2_top_p" id="gpt_sovits_v2_top_p_counter">
                </div>
            </div>
        </div>
        <div class="range-block">
            <div class="range-block-title justifyLeft">
                <label>Temperature</label>
            </div>
            <div class="range-block-range-and-counter">
                <div class="range-block-range">
                    <input id='gpt_sovits_v2_temperature' type="range" min="0" max="1" step="0.05" value="${this.defaultSettings.temperature}"/>
                </div>
                <div class="range-block-counter">
                    <input type="number" min="0" max="1" step="0.05" data-for="gpt_sovits_v2_temperature" id="gpt_sovits_v2_temperature_counter">
                </div>
            </div>
        </div>
        <div class="range-block">
            <div class="range-block-title justifyLeft">
                <label>Repetition Penalty</label>
            </div>
            <div class="range-block-range-and-counter">
                <div class="range-block-range">
                    <input id='gpt_sovits_v2_repetition_penalty' type="range" min="0" max="2" step="0.05" value="${this.defaultSettings.repetition_penalty}"/>
                </div>
                <div class="range-block-counter">
                    <input type="number" min="0" max="2" step="0.05" data-for="gpt_sovits_v2_repetition_penalty" id="gpt_sovits_v2_repetition_penalty_counter">
                </div>
            </div>
        </div>
        <br/>
        `;

        return html;
    }

    onSettingsChange() {
        // Used when provider settings are updated from UI
        this.settings.provider_endpoint = $('#tts_endpoint').val();
        this.settings.text_lang = $('#text_lang').val();
        this.settings.prompt_lang = $('#prompt_lang').val();
        this.settings.gpt_weight = $("#gpt_weights_voice").val();
        this.settings.sovits_weight = $("#sovits_weights_voice").val();
        this.settings.batch_size = Number($('#gpt_sovits_v2_batch_size').val());
        this.settings.fragment_interval = Number($('#gpt_sovits_v2_fragment_interval').val());
        this.settings.speed_factor = Number($('#gpt_sovits_v2_speed_factor').val());
        this.settings.top_k = Number($('#gpt_sovits_v2_top_k').val());
        this.settings.top_p = Number($('#gpt_sovits_v2_top_p').val());
        this.settings.temperature = Number($('#gpt_sovits_v2_temperature').val());
        this.settings.repetition_penalty = Number($('#gpt_sovits_v2_repetition_penalty').val());

        $('#gpt_sovits_v2_batch_size_counter').val(this.settings.batch_size);
        $('#gpt_sovits_v2_fragment_interval_counter').val(this.settings.fragment_interval);
        $('#gpt_sovits_v2_speed_factor_counter').val(this.settings.speed_factor);
        $('#gpt_sovits_v2_top_k_counter').val(this.settings.top_k);
        $('#gpt_sovits_v2_top_p_counter').val(this.settings.top_p);
        $('#gpt_sovits_v2_temperature_counter').val(this.settings.temperature);
        $('#gpt_sovits_v2_repetition_penalty_counter').val(this.settings.repetition_penalty);

        saveTtsProviderSettings();
        this.changeTTSSettings();
    }

    async loadSettings(settings) {
        // Pupulate Provider UI given input settings
        if (Object.keys(settings).length == 0) {
            console.info('Using default TTS Provider settings');
        }

        // Only accept keys defined in defaultSettings
        this.settings = this.defaultSettings;

        for (const key in settings) {
            if (key in this.settings) {
                this.settings[key] = settings[key];
            } else {
                console.debug(`Ignoring non-user-configurable setting: ${key}`);
            }
        }

        // Set initial values from the settings
        $('#tts_endpoint').val(this.settings.provider_endpoint).on('change', this.onSettingsChange.bind(this));
        $('#text_lang').val(this.settings.text_lang).on('change', this.onSettingsChange.bind(this));
        $('#prompt_lang').val(this.settings.prompt_lang).on('change', this.onSettingsChange.bind(this));
        $('#gpt_sovits_v2_batch_size').val(this.settings.batch_size);
        $('#gpt_sovits_v2_batch_size_counter').val(this.settings.batch_size);
        $('#gpt_sovits_v2_batch_size').on('input', () => this.onSettingsChange());
        $('#gpt_sovits_v2_fragment_interval').val(this.settings.fragment_interval);
        $('#gpt_sovits_v2_fragment_interval_counter').val(this.settings.fragment_interval);
        $('#gpt_sovits_v2_fragment_interval').on('input', () => this.onSettingsChange());
        $('#gpt_sovits_v2_speed_factor').val(this.settings.speed_factor);
        $('#gpt_sovits_v2_speed_factor_counter').val(this.settings.speed_factor);
        $('#gpt_sovits_v2_speed_factor').on('input', () => this.onSettingsChange());
        $('#gpt_sovits_v2_top_k').val(this.settings.top_k);
        $('#gpt_sovits_v2_top_k_counter').val(this.settings.top_k);
        $('#gpt_sovits_v2_top_k').on('input', () => this.onSettingsChange());
        $('#gpt_sovits_v2_top_p').val(this.settings.top_p);
        $('#gpt_sovits_v2_top_p_counter').val(this.settings.top_p);
        $('#gpt_sovits_v2_top_p').on('input', () => this.onSettingsChange());
        $('#gpt_sovits_v2_temperature').val(this.settings.temperature);
        $('#gpt_sovits_v2_temperature_counter').val(this.settings.temperature);
        $('#gpt_sovits_v2_temperature').on('input', () => this.onSettingsChange());
        $('#gpt_sovits_v2_repetition_penalty').val(this.settings.repetition_penalty);
        $('#gpt_sovits_v2_repetition_penalty_counter').val(this.settings.repetition_penalty);
        $('#gpt_sovits_v2_repetition_penalty').on('input', () => this.onSettingsChange());

        await this.checkReady();

        console.info('ITS: Settings loaded');
    }

    // Perform a simple readiness check by trying to fetch voiceIds
    async checkReady() {
        await Promise.allSettled([
            this.fetchTtsVoiceObjects(),
            this.fetchGPTWeights(),
            this.fetchSoVITSWeights(),
            this.changeTTSSettings()
        ]);
    }

    async onRefreshClick() {
        return await this.checkReady();
    }

    //#################//
    //  TTS Interfaces //
    //#################//

    async getVoice(voiceName) {
        if (this.voices.length == 0) {
            this.voices = await this.fetchTtsVoiceObjects();
        }


        const match = this.voices.filter(
            v => v.name == voiceName,
        )[0];
        console.log(match);
        if (!match) {
            throw `TTS Voice name ${voiceName} not found`;
        }
        return match;
    }


    async generateTts(text, voiceId) {
        const response = await this.fetchTtsGeneration(text, voiceId);
        return response;
    }

    //###########//
    // API CALLS //
    //###########//
    async fetchTtsVoiceObjects() {
        const response = await fetch(`${this.settings.provider_endpoint}/speakers`);
        console.info(response);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${await response.json()}`);
        }
        const responseJson = await response.json();


        this.voices = responseJson;

        return responseJson;
    }

    async fetchGPTWeights() {
        let selectElement = $(`#gpt_weights_voice`);
        selectElement.empty();
        const response = await fetch(
            `${this.settings.provider_endpoint}/get_gpt_weights`
        );
        console.info(response);

        if (!response.ok) {
            throw new Error(
                `HTTP ${response.status}: ${await response.json()}`
            );
        }
        const responseJson = await response.json();

        this.gpt_weights = responseJson;

        for (const voiceId of this.gpt_weights) {
            if (!this.settings.gpt_weight || this.settings.gpt_weight.length == 0) {
                this.settings.gpt_weight = voiceId.name;
            }
            const option = document.createElement("option");
            option.innerText = voiceId.name;
            option.value = voiceId.name;
            selectElement.append(option);
        }

        selectElement.on("change", () => this.reqSetGPTSWeight());
        selectElement.val(this.settings.gpt_weight);

        return responseJson;
    }

    async reqSetGPTSWeight() {
        if (this.settings.gpt_weight == $("#gpt_weights_voice").val()) {
            return;
        }
        this.onSettingsChange();
        const response = await fetch(
            `${this.settings.provider_endpoint}/set_gpt_weights?weights_path=GPT_weights_v2/${this.settings.gpt_weight}`
        );
        console.info(response);

        if (!response.ok) {
            throw new Error(
                `HTTP ${response.status}: ${await response.json()}`
            );
        }
    }

    async fetchSoVITSWeights() {
        let selectElement = $(`#sovits_weights_voice`);
        selectElement.empty();
        const response = await fetch(
            `${this.settings.provider_endpoint}/get_sovits_weights`
        );
        console.info(response);

        if (!response.ok) {
            throw new Error(
                `HTTP ${response.status}: ${await response.json()}`
            );
        }
        const responseJson = await response.json();

        this.sovits_weights = responseJson;

        for (const voiceId of this.sovits_weights) {
            if (!this.settings.sovits_weight || this.settings.sovits_weight.length == 0) {
                this.settings.sovits_weight = voiceId.name;
            }
            const option = document.createElement("option");
            option.innerText = voiceId.name;
            option.value = voiceId.name;
            selectElement.append(option);
        }

        selectElement.on("change", () => this.reqSetSoVITSWeight());
        selectElement.val(this.settings.sovits_weight);

        return responseJson;
    }

    async reqSetSoVITSWeight() {
        if (this.settings.sovits_weight == $("#sovits_weights_voice").val()) {
            return;
        }
        this.onSettingsChange();
        const response = await fetch(
            `${this.settings.provider_endpoint}/set_sovits_weights?weights_path=SoVITS_weights_v2/${this.settings.sovits_weight}`
        );
        console.info(response);

        if (!response.ok) {
            throw new Error(
                `HTTP ${response.status}: ${await response.json()}`
            );
        }
    }

    // Each time a parameter is changed, we change the configuration
    async changeTTSSettings() {
    }

    /**
     * Fetch TTS generation from the API.
     * @param {string} inputText Text to generate TTS for
     * @param {string} voiceId Voice ID to use (model_type&speaker_id))
     * @returns {Promise<Response|string>} Fetch response
     */


    async fetchTtsGeneration(inputText, voiceId, lang = null, forceNoStreaming = false) {
        console.info(`Generating new TTS for voice_id ${voiceId}`);

        function replaceSpeaker(text) {
            return text.replace(/\[.*?\]/gu, '');
        }

        let prompt_text = replaceSpeaker(voiceId);

        const params = {
            text: inputText,
            prompt_text: prompt_text,
            ref_audio_path: './参考音频/' + voiceId + '.wav',
            text_lang: this.settings.text_lang,
            prompt_lang: this.settings.prompt_lang,
            text_split_method: 'cut5',
            batch_size: this.settings.batch_size,
            media_type: 'ogg',
            streaming_mode: 'true',
            fragment_interval: this.settings.fragment_interval,
            speed_factor: this.settings.speed_factor,
            top_k: this.settings.top_k,
            top_p: this.settings.top_p,
            temperature: this.settings.temperature,
            repetition_penalty: this.settings.repetition_penalty,
        };

        const url = `${this.settings.provider_endpoint}/`;

        const response = await fetch(
            url,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(params), // Convert parameter objects to JSON strings
            },
        );
        if (!response.ok) {
            toastr.error(response.statusText, 'TTS Generation Failed');
            throw new Error(`HTTP ${response.status}: ${await response.text()}`);
        }
        return response;
    }


    // Interface not used
    async fetchTtsFromHistory(history_item_id) {
        return Promise.resolve(history_item_id);
    }

    async previewTtsVoice(id) {
        this.audioElement.pause();
        this.audioElement.currentTime = 0;

        const text = getPreviewString("zh-CN");
        const response = await this.fetchTtsGeneration(text, id);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const audio = await response.blob();
        const url = URL.createObjectURL(audio);
        this.audioElement.src = url;
        this.audioElement.play();
        this.audioElement.onended = () => URL.revokeObjectURL(url);
    }
}
