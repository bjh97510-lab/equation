// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, cleanup, within, configure } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import GuidedSolver from '../src/components/problem/GuidedSolver.jsx';
import { generateProblem } from '../src/engine/problemGenerator.js';
import { planGuided } from '../src/engine/guided.js';

configure({ asyncUtilTimeout: 5000 });

/** 현재 화면에 떠 있는 단계 카드 */
function currentStep() {
  const cards = document.querySelectorAll('.guided-step');
  return cards[cards.length - 1];
}

/** 빈칸 단계: 플래너가 알고 있는 정답을 그대로 채우고 확인 */
function fillStep(step) {
  const card = currentStep();
  const inputs = within(card).getAllByRole('textbox');
  const answers = step.lines.flatMap((l) => l.answers);
  expect(inputs.length).toBe(answers.length);
  inputs.forEach((inp, i) => fireEvent.change(inp, { target: { value: String(answers[i]) } }));
  fireEvent.click(within(card).getByRole('button', { name: /확인/ }));
}

function pickOption(card, optionId, step) {
  const opt = step.options.find((o) => o.id === optionId);
  const idx = step.options.indexOf(opt);
  const buttons = within(card).getAllByRole('button').filter((b) => b.className.includes('choice-btn'));
  fireEvent.click(buttons[idx]);
}

/**
 * 플래너의 단계 목록을 따라 UI 를 끝까지 진행한다.
 * decisions: 선택 단계에서 고를 값
 */
function walkThrough(problem, decisions, { wrongOpFirst = false } = {}) {
  let made = {};
  for (let guard = 0; guard < 30; guard++) {
    const { steps, complete } = planGuided(problem, made);
    const card = currentStep();
    const stepTitleEl = card.querySelector('.guided-step-title h3');
    const stepIdx = Number(card.querySelector('.num').textContent) - 1;
    const step = steps[stepIdx];
    expect(stepTitleEl.textContent).toBe(step.title);

    if (step.kind === 'choice') {
      if (step.key === 'op' && wrongOpFirst) {
        const wrong = step.options.find((o) => !o.correct);
        pickOption(card, wrong.id, step);
        expect(within(card).getByText(/다시 생각해 볼까요/)).toBeTruthy();
      }
      const want = step.free ? decisions[step.key] : step.options.find((o) => o.correct).id;
      pickOption(card, want, step);
      made = { ...made, [step.key]: want };
      fireEvent.click(within(card).getByRole('button', { name: /다음 단계/ }));
    } else if (step.kind === 'blanks') {
      fillStep(step);
      expect(within(card).getByText(/잘했어요|함께 채웠어요/)).toBeTruthy();
      fireEvent.click(within(card).getByRole('button', { name: /다음 단계/ }));
    } else if (step.kind === 'final') {
      expect(complete).toBe(true);
      return { steps, made };
    }
  }
  throw new Error('단계가 끝나지 않았어요');
}

describe('단계별 풀이 UI', () => {
  beforeEach(() => {
    cleanup();
    window.scrollTo = () => {};
  });

  it('가감법: 선택 → 빈칸 → 최종 정답까지 진행하고 onSubmit 이 호출된다', () => {
    const problem = generateProblem('simultaneous', 'advanced', []);
    const onSubmit = vi.fn(() => ({ rewardEarned: 2 }));
    render(
      <MemoryRouter>
        <GuidedSolver problem={problem} onSubmit={onSubmit} onNext={() => {}} />
      </MemoryRouter>,
    );
    expect(screen.getByText(/STEP 1 \//)).toBeTruthy();
    walkThrough(problem, { method: 'elim', elimVar: 'y', subInto: '1' }, { wrongOpFirst: problem.guided.form !== 'bracket' });

    // 풀이 노트에 완성한 식이 쌓인다
    expect(document.querySelectorAll('.guided-notes li').length).toBeGreaterThan(0);

    // 최종 정답: 먼저 틀린 값
    fireEvent.change(screen.getByLabelText('최종 x 값'), { target: { value: '9999' } });
    fireEvent.change(screen.getByLabelText('최종 y 값'), { target: { value: String(problem.answer.y) } });
    fireEvent.click(screen.getByRole('button', { name: /정답 확인/ }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit.mock.calls[0][1].correct).toBe(false);
    expect(onSubmit.mock.calls[0][1].attemptNumber).toBe(1);
    expect(screen.getByText(/거의 다 왔어요/)).toBeTruthy();

    // 고쳐서 정답
    fireEvent.change(screen.getByLabelText('최종 x 값'), { target: { value: String(problem.answer.x) } });
    fireEvent.click(screen.getByRole('button', { name: /정답 확인/ }));
    expect(onSubmit).toHaveBeenCalledTimes(2);
    expect(onSubmit.mock.calls[1][1].correct).toBe(true);
    expect(onSubmit.mock.calls[1][1].attemptNumber).toBe(2);
    expect(onSubmit.mock.calls[1][1].guided).toBe(true);
    expect(screen.getByText(/단계별 풀이 완료/)).toBeTruthy();
    expect(screen.getByText(/🌰 \+2/)).toBeTruthy();
  });

  it('대입법 문제: 대입법을 고르면 대입 단계로 진행된다', () => {
    let problem;
    for (let i = 0; i < 100; i++) {
      problem = generateProblem('simultaneous', 'standard', []);
      if (problem.guided.form === 'subst') break;
    }
    expect(problem.guided.form).toBe('subst');
    const onSubmit = vi.fn(() => ({ rewardEarned: 1 }));
    render(
      <MemoryRouter>
        <GuidedSolver problem={problem} onSubmit={onSubmit} onNext={() => {}} />
      </MemoryRouter>,
    );
    const { steps } = walkThrough(problem, { method: 'subst' });
    expect(steps.map((s) => s.key)).toContain('simplify');
    fireEvent.change(screen.getByLabelText('최종 x 값'), { target: { value: String(problem.answer.x) } });
    fireEvent.change(screen.getByLabelText('최종 y 값'), { target: { value: String(problem.answer.y) } });
    fireEvent.click(screen.getByRole('button', { name: /정답 확인/ }));
    expect(onSubmit.mock.calls[0][1].correct).toBe(true);
    expect(onSubmit.mock.calls[0][1].hintLevel).toBe(0);
  });

  it('빈칸을 두 번 틀리면 "답 채워 보기"가 나타나고, 채우면 다음 단계로 갈 수 있다', () => {
    const problem = generateProblem('simultaneous', 'challenge', []); // 활용 문제: 첫 단계가 식 세우기
    render(
      <MemoryRouter>
        <GuidedSolver problem={problem} onSubmit={() => ({})} onNext={() => {}} />
      </MemoryRouter>,
    );
    const card = currentStep();
    expect(card.querySelector('h3').textContent).toBe('식 세우기');
    const inputs = within(card).getAllByRole('textbox');
    for (let t = 0; t < 2; t++) {
      inputs.forEach((inp) => fireEvent.change(inp, { target: { value: '12345' } }));
      fireEvent.click(within(card).getByRole('button', { name: /확인/ }));
      expect(within(card).getAllByText(/다시 확인해 볼까요/).length).toBeGreaterThan(0);
    }
    fireEvent.click(within(card).getByRole('button', { name: /답 채워 보기/ }));
    expect(within(card).getByText(/함께 채웠어요/)).toBeTruthy();
    fireEvent.click(within(card).getByRole('button', { name: /다음 단계/ }));
    expect(currentStep().querySelector('.num').textContent).toBe('2');
  });
});

describe('일차·이차방정식 도전 문제 단계별 풀이 UI', () => {
  beforeEach(() => {
    cleanup();
    window.scrollTo = () => {};
  });

  for (const unit of ['linear', 'quadratic']) {
    it(`${unit}: 선택 → 빈칸 → 최종 답 입력까지 완주한다`, () => {
      const problem = generateProblem(unit, 'challenge', []);
      const onSubmit = vi.fn(() => ({ rewardEarned: 3 }));
      render(
        <MemoryRouter>
          <GuidedSolver problem={problem} onSubmit={onSubmit} onNext={() => {}} />
        </MemoryRouter>,
      );
      const { steps } = walkThrough(problem, {});
      expect(steps.map((s) => s.key)).toContain('check');
      // 단일 답 입력
      expect(screen.queryByLabelText('최종 y 값')).toBeNull();
      fireEvent.change(screen.getByLabelText('최종 답'), { target: { value: String(problem.answer.value) } });
      fireEvent.click(screen.getByRole('button', { name: /정답 확인/ }));
      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect(onSubmit.mock.calls[0][1].correct).toBe(true);
      expect(screen.getByText(/단계별 풀이 완료/)).toBeTruthy();
      expect(screen.getByText(/🌰 \+3/)).toBeTruthy();
    });
  }
});

describe('일차·이차방정식 전 난이도 단계별 풀이 UI', () => {
  beforeEach(() => {
    cleanup();
    window.scrollTo = () => {};
  });

  it('일차방정식 기초: 선택 → 빈칸 → x 입력까지 완주한다', () => {
    const problem = generateProblem('linear', 'basic', []);
    const onSubmit = vi.fn(() => ({ rewardEarned: 1 }));
    render(
      <MemoryRouter>
        <GuidedSolver problem={problem} onSubmit={onSubmit} onNext={() => {}} />
      </MemoryRouter>,
    );
    walkThrough(problem, {});
    fireEvent.change(screen.getByLabelText('최종 답'), { target: { value: problem.answer.display } });
    fireEvent.click(screen.getByRole('button', { name: /정답 확인/ }));
    expect(onSubmit.mock.calls[0][1].correct).toBe(true);
    expect(screen.getByText(/단계별 풀이 완료/)).toBeTruthy();
  });

  for (const d of ['basic', 'standard', 'advanced']) {
    it(`이차방정식 ${d}: 두 근을 순서 바꿔 입력해도 정답 (무리근은 √ 표기)`, () => {
      const problem = generateProblem('quadratic', d, []);
      const onSubmit = vi.fn(() => ({ rewardEarned: 2 }));
      render(
        <MemoryRouter>
          <GuidedSolver problem={problem} onSubmit={onSubmit} onNext={() => {}} />
        </MemoryRouter>,
      );
      const { steps } = walkThrough(problem, {});
      expect(steps.map((s) => s.key)).toContain('roots');
      const [a, b] = problem.answer.display;
      fireEvent.change(screen.getByLabelText('최종 첫 번째 근'), { target: { value: b } });
      fireEvent.change(screen.getByLabelText('최종 두 번째 근'), { target: { value: a } });
      fireEvent.click(screen.getByRole('button', { name: /정답 확인/ }));
      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect(onSubmit.mock.calls[0][1].correct).toBe(true);
      expect(screen.getByText(/단계별 풀이 완료/)).toBeTruthy();
    });
  }
});
