/** A small command line over the page. Commands read from the JSON in Shell.astro. */

export interface SiteData {
  name: string;
  role: string;
  about: string[];
  education: { period: string; title: string; organisation: string }[];
  experience: { period: string; title: string; organisation: string }[];
  skills: { label: string; items: string[] }[];
  projects: { name: string; category: string; href?: string }[];
  links: { label: string; href: string }[];
}

type Navigate = (target: 'home' | 'portfolio' | 'profile' | 'work') => void;

const escape = (text: string) => text.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

export class Terminal {
  private out: HTMLElement;
  private input: HTMLInputElement;
  private history: string[] = [];
  private cursor = 0;
  private greeted = false;
  private returnFocus?: HTMLElement | null;

  constructor(private root: HTMLElement, private data: SiteData, private navigate: Navigate, private onToggle: (open: boolean) => void) {
    this.out = root.querySelector('[data-terminal-out]')!;
    this.input = root.querySelector('[data-terminal-input]')!;
    root.querySelector('form')!.addEventListener('submit', (event) => {
      event.preventDefault();
      const value = this.input.value.trim();
      this.input.value = '';
      if (value) {
        this.history.push(value);
        this.cursor = this.history.length;
      }
      this.print(`<span class="warm">$</span> ${escape(value)}`);
      if (value) this.run(value);
    });
    this.input.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
        event.preventDefault();
        this.cursor = Math.max(0, Math.min(this.history.length, this.cursor + (event.key === 'ArrowUp' ? -1 : 1)));
        this.input.value = this.history[this.cursor] ?? '';
      }
      if (event.key === 'Tab') {
        event.preventDefault();
        const match = Object.keys(this.commands).find((name) => name.startsWith(this.input.value));
        if (match) this.input.value = match;
      }
    });
    root.addEventListener('pointerdown', (event) => {
      if (!(event.target as Element).closest('a')) requestAnimationFrame(() => this.input.focus());
    });
  }

  get isOpen() {
    return this.root.classList.contains('is-open');
  }

  open() {
    if (this.isOpen) return;
    this.returnFocus = document.activeElement as HTMLElement | null;
    this.root.hidden = false;
    void this.root.offsetWidth; // start the open transition from the closed state
    this.root.classList.add('is-open');
    if (!this.greeted) {
      this.greeted = true;
      this.print(`<span class="dim">${escape(this.data.name)} — ${escape(this.data.role)}\nType <span class="warm">help</span> to see what you can do.</span>`);
    }
    this.input.focus({ preventScroll: true });
    this.onToggle(true);
  }

  close() {
    if (!this.isOpen) return;
    this.root.classList.remove('is-open');
    window.setTimeout(() => { if (!this.isOpen) this.root.hidden = true; }, 500);
    this.returnFocus?.focus?.({ preventScroll: true });
    this.onToggle(false);
  }

  toggle() {
    if (this.isOpen) this.close(); else this.open();
  }

  private print(html: string) {
    const line = document.createElement('div');
    line.innerHTML = html;
    this.out.append(line);
    this.out.scrollTop = this.out.scrollHeight;
  }

  private link(label: string, href: string) {
    const external = /^https?:/.test(href);
    return `<a href="${escape(href)}"${external ? ' target="_blank" rel="noreferrer"' : ''}>${escape(label)}</a>`;
  }

  private commands: Record<string, { help: string; run: (args: string[]) => void }> = {
    help: {
      help: 'list commands',
      run: () => this.print(Object.entries(this.commands)
        .map(([name, { help }]) => `  <span class="warm">${name.padEnd(11)}</span><span class="dim">${help}</span>`).join('\n')),
    },
    whoami: { help: 'who is this', run: () => this.print(`${escape(this.data.name)}\n<span class="dim">${escape(this.data.role)}</span>`) },
    about: { help: 'short bio', run: () => this.print(this.data.about.map(escape).join('\n\n')) },
    education: {
      help: 'degrees',
      run: () => this.print(this.data.education.map((e) => `${escape(e.title)}\n<span class="dim">  ${escape(e.organisation)} · ${escape(e.period)}</span>`).join('\n')),
    },
    experience: {
      help: 'work history',
      run: () => this.print(this.data.experience.length
        ? this.data.experience.map((e) => `${escape(e.title)}\n<span class="dim">  ${escape(e.organisation)} · ${escape(e.period)}</span>`).join('\n')
        : '<span class="dim">Nothing listed yet. Try education.</span>'),
    },
    skills: {
      help: 'languages and tools',
      run: () => this.print(this.data.skills.map((s) => `<span class="dim">${escape(s.label.padEnd(18))}</span>${escape(s.items.join(', '))}`).join('\n')),
    },
    projects: {
      help: 'selected work',
      run: () => this.print(this.data.projects.map((p) => `${p.href ? this.link(p.name, p.href) : escape(p.name)} <span class="dim">— ${escape(p.category)}</span>`).join('\n')),
    },
    contact: {
      help: 'where to find me',
      run: () => this.print(this.data.links.map((l) => this.link(l.label, l.href)).join('   ')),
    },
    open: {
      help: 'open portfolio | profile | work',
      run: ([target]) => {
        if (target === 'portfolio' || target === 'profile' || target === 'work' || target === 'home') {
          this.close();
          this.navigate(target);
        } else this.print('<span class="dim">usage: open portfolio | profile | work</span>');
      },
    },
    date: { help: 'local time', run: () => this.print(new Date().toString()) },
    clear: { help: 'clear the screen', run: () => this.out.replaceChildren() },
    exit: { help: 'close the terminal', run: () => this.close() },
  };

  private run(value: string) {
    const [name, ...args] = value.toLowerCase().split(/\s+/);
    const command = this.commands[name];
    if (command) command.run(args);
    else if (name === 'sudo') this.print('<span class="dim">Nice try.</span>');
    else this.print(`<span class="dim">command not found: ${escape(name)} — try help</span>`);
  }
}
