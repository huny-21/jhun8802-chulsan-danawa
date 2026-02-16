(() => {
    const config = window.ADSENSE_CONFIG || {};
    const sections = Array.from(document.querySelectorAll('[data-adsense-slot]'));
    if (!sections.length) return;

    const isValidClient = typeof config.client === 'string' && /^ca-pub-\d{16}$/.test(config.client);
    const slots = config.slots || {};
    const hasValidSlots = ['top', 'bottom'].every((key) => typeof slots[key] === 'string' && /^\d+$/.test(slots[key]));
    const enabled = Boolean(config.enabled) && isValidClient && hasValidSlots;

    if (!enabled) {
        sections.forEach((section) => {
            section.hidden = true;
        });
        return;
    }

    const adsenseScript = document.createElement('script');
    adsenseScript.async = true;
    adsenseScript.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(config.client)}`;
    adsenseScript.crossOrigin = 'anonymous';
    document.head.appendChild(adsenseScript);

    sections.forEach((section) => {
        const unitName = section.getAttribute('data-adsense-slot');
        const unit = section.querySelector('.adsense-unit');
        const slot = slots[unitName];
        if (!unit || !slot) {
            section.hidden = true;
            return;
        }
        unit.setAttribute('data-ad-client', config.client);
        unit.setAttribute('data-ad-slot', slot);
        unit.setAttribute('data-ad-format', 'auto');
        unit.setAttribute('data-full-width-responsive', 'true');
        unit.style.display = 'block';
    });

    adsenseScript.addEventListener('load', () => {
        sections.forEach((section) => {
            if (section.hidden) return;
            const unit = section.querySelector('.adsense-unit');
            if (!unit) return;
            try {
                (window.adsbygoogle = window.adsbygoogle || []).push({});
            } catch (error) {
                console.error('AdSense init failed:', error);
            }
        });
    });
})();
