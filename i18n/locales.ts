import { activity_panel } from './modules/activity_panel';
import { agent_party } from './modules/agent_party';
import { app } from './modules/app';
import { article_modal } from './modules/article_modal';
import { articleAnalysisModal } from './modules/articleAnalysisModal';
import { capabilities } from './modules/capabilities';
import { capability_history } from './modules/capability_history';
import { capability_formatters } from './modules/capability_formatters';
import { capability_modal } from './modules/capability_modal';
import { chat } from './modules/chat';
import { common } from './modules/common';
import { competition_join } from './modules/competition_join';
import { confirm_modal } from './modules/confirm_modal';
import { edit_agent } from './modules/edit_agent';
import { external_agent } from './modules/external_agent';
import { invite } from './modules/invite';
import { landing } from './modules/landing';
import { login } from './modules/login';
import { nav } from './modules/nav';
import { notification_history } from './modules/notification_history';
import { notification_system } from './modules/notification_system';
import { notifications } from './modules/notifications';
import { ranking } from './modules/ranking';
import { season_info_panel } from './modules/season_info_panel';
import { season_pass } from './modules/season_pass';
import { stock_selection_panel } from './modules/stock_selection_panel';
import { stock_analysis_panel } from './modules/stock_analysis_panel';
import { create_agent_modal } from './modules/create_agent_modal';
import { stock_activity_task_params } from './modules/stock_activity_task_params';

export const translations = {
  zh: {
    common: common.zh,
    app: app.zh,
    nav: nav.zh,
    ranking: ranking.zh,
    season_info_panel: season_info_panel.zh,
    activity_panel: activity_panel.zh,
    capabilities: capabilities.zh,
    capability_formatters: capability_formatters.zh,
    capability_modal: capability_modal.zh,
    article_analysis_modal: articleAnalysisModal.zh,
    capability_history: capability_history.zh,
    external_agent: external_agent.zh,
    chat: chat.zh,
    article_modal: article_modal.zh,
    competition_join: competition_join.zh,
    confirm_modal: confirm_modal.zh,
    notifications: notifications.zh,
    edit_agent: edit_agent.zh,
    notification_history: notification_history.zh,
    notification_system: notification_system.zh,
    agent_party: agent_party.zh,
    landing: landing.zh,
    season_pass: season_pass.zh,
    login: login.zh,
    invite: invite.zh,
    stock_selection_panel: stock_selection_panel.zh,
    stock_analysis_panel: stock_analysis_panel.zh,
    create_agent_modal: create_agent_modal.zh,
    stock_activity_task_params: stock_activity_task_params.zh
  },
  en: {
    common: common.en,
    app: app.en,
    nav: nav.en,
    ranking: ranking.en,
    season_info_panel: season_info_panel.en,
    activity_panel: activity_panel.en,
    capabilities: capabilities.en,
    capability_formatters: capability_formatters.en,
    capability_modal: capability_modal.en,

    article_analysis_modal: articleAnalysisModal.en,
    capability_history: capability_history.en,
    external_agent: external_agent.en,
    chat: chat.en,
    article_modal: article_modal.en,
    competition_join: competition_join.en,
    confirm_modal: confirm_modal.en,
    notifications: notifications.en,
    edit_agent: edit_agent.en,
    notification_history: notification_history.en,
    notification_system: notification_system.en,
    agent_party: agent_party.en,
    landing: landing.en,
    season_pass: season_pass.en,
    login: login.en,
    invite: invite.en,
    stock_selection_panel: stock_selection_panel.en,
    stock_analysis_panel: stock_analysis_panel.en,
    create_agent_modal: create_agent_modal.en,
    stock_activity_task_params: stock_activity_task_params.en
  }
};
