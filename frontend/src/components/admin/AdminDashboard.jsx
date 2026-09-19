import React, { useState, useEffect } from "react";
import PageBackdrop from "../art/PageBackdrop";

import {
  LayoutDashboard, Users, FileText, Building2, Activity,
  LogOut, Search, Edit3, Trash2, Plus,
  Eye, BarChart3, TrendingUp,
  AlertTriangle, Clock, Shield
} from "lucide-react";
// No fake users — in production, fetch from backend API
var SAMPLE_USERS = [];

// No fake schemes — in production, fetch from backend API
var SAMPLE_SCHEMES = [];

// No fake banks — in production, fetch from backend API
var SAMPLE_BANKS = [];

// No fake activity — in production, fetch from backend API
var ACTIVITY_LOG = [];
function StatCard(props) {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-white/70 shadow-sm p-5 hover:shadow-md transition-shadow">
      <div className={"w-10 h-10 rounded-lg flex items-center justify-center mb-3 " + props.color}>
        {props.icon}
      </div>
      <p className="text-2xl font-bold text-gray-900">{props.value}</p>
      <p className="text-sm text-gray-500">{props.label}</p>
    </div>
  );
}

function OverviewTab({ stats }) {
  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={<Users className="w-5 h-5 text-white" />} label="Total Users" value={stats.totalUsers} color="bg-[#138808]" />
        <StatCard icon={<FileText className="w-5 h-5 text-white" />} label="Active Schemes" value={stats.totalSchemes} color="bg-[#000080]" />
        <StatCard icon={<Building2 className="w-5 h-5 text-white" />} label="Bank Partners" value={stats.totalBanks} color="bg-[#FF9933]" />
        <StatCard icon={<BarChart3 className="w-5 h-5 text-white" />} label="Disbursed" value={stats.disbursed} color="bg-[#138808]" />
      </div>
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h3 className="font-semibold text-[#000080] mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-[#FF9933]" /> Recent Activity
        </h3>
        <div className="space-y-3">
          {ACTIVITY_LOG.length === 0 ? (<div className="p-6 text-center text-gray-400">No recent activity. Activity logs will appear here when users interact with the platform.</div>) : ACTIVITY_LOG.map(function(item) {
            var iconMap = {
              user: <Users className="w-4 h-4 text-[#138808]" />,
              scheme: <FileText className="w-4 h-4 text-[#000080]" />,
              disbursement: <TrendingUp className="w-4 h-4 text-[#138808]" />,
              alert: <AlertTriangle className="w-4 h-4 text-[#FF9933]" />,
              application: <Clock className="w-4 h-4 text-[#000080]" />,
              bank: <Building2 className="w-4 h-4 text-[#000080]" />
            };
            return (
              <div key={item.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">{iconMap[item.type]}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{item.action}</p>
                  <p className="text-xs text-gray-500 truncate">{item.detail}</p>
                </div>
                <span className="text-xs text-gray-400 flex-shrink-0">{item.time}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
function UsersTab() {
  var [search, setSearch] = useState("");
  var filtered = SAMPLE_USERS.filter(function(u) {
    return u.name.toLowerCase().includes(search.toLowerCase()) || u.phone.includes(search) || u.state.toLowerCase().includes(search.toLowerCase());
  });
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
      <div className="p-4 border-b border-gray-100 flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" value={search} onChange={function(e){setSearch(e.target.value)}} placeholder="Search users..." className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:border-[#138808] focus:ring-2 focus:ring-[#138808]/20 outline-none text-sm" />
        </div>
        <span className="text-sm text-gray-500">{filtered.length} user{filtered.length !== 1 ? "s" : ""}</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="bg-gray-50">
            <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">Phone</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">State</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">Category</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">Income</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">Actions</th>
          </tr></thead>
          <tbody>
            {filtered.map(function(u) {
              return (
                <tr key={u.id} className="border-t border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900">{u.name}</td>
                  <td className="px-4 py-3 text-gray-600">{u.phone}</td>
                  <td className="px-4 py-3 text-gray-600">{u.state}</td>
                  <td className="px-4 py-3"><span className="px-2 py-1 rounded-full text-xs font-medium bg-[#000080]/10 text-[#000080]">{u.category}</span></td>
                  <td className="px-4 py-3 text-gray-600">{(u.income/100000).toFixed(1)}L</td>
                  <td className="px-4 py-3"><span className={"px-2 py-1 rounded-full text-xs font-medium " + (u.status === "Active" ? "bg-[#138808]/10 text-[#138808]" : "bg-[#FF9933]/10 text-[#FF9933]")}>{u.status}</span></td>
                  <td className="px-4 py-3"><button className="text-[#138808] hover:underline text-xs"><Eye className="w-4 h-4 inline" /> View</button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
function SchemesTab() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
      <div className="p-4 border-b border-gray-100 flex items-center justify-between">
        <h3 className="font-semibold text-[#000080]">Government Schemes</h3>
        <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#138808] text-white text-sm hover:bg-[#0f6d06] transition-colors"><Plus className="w-4 h-4" /> Add Scheme</button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="bg-gray-50">
            <th className="text-left px-4 py-3 font-medium text-gray-600">Scheme Name</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">Type</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">Max Amount</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">Interest</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">Ministry</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">Users</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">Actions</th>
          </tr></thead>
          <tbody>
            {SAMPLE_SCHEMES.length === 0 ? (<tr><td colSpan="5" className="px-4 py-8 text-center text-gray-400">No schemes available. Schemes will appear here when synced from myScheme.gov.in.</td></tr>) : SAMPLE_SCHEMES.map(function(s) {
              return (
                <tr key={s.id} className="border-t border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900">{s.name}</td>
                  <td className="px-4 py-3 text-gray-600">{s.type}</td>
                  <td className="px-4 py-3 text-gray-600">{s.maxAmount >= 100000 ? (s.maxAmount/100000) + "L" : (s.maxAmount/1000) + "K"}</td>
                  <td className="px-4 py-3 text-gray-600">{s.interest}</td>
                  <td className="px-4 py-3"><span className="px-2 py-1 rounded-full text-xs font-medium bg-[#000080]/10 text-[#000080]">{s.ministry}</span></td>
                  <td className="px-4 py-3 text-gray-600">{s.users}</td>
                  <td className="px-4 py-3 flex gap-2"><button className="text-[#138808] hover:underline text-xs"><Edit3 className="w-4 h-4 inline" /> Edit</button><button className="text-red-500 hover:underline text-xs"><Trash2 className="w-4 h-4 inline" /> Delete</button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
function BanksTab() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
      <div className="p-4 border-b border-gray-100 flex items-center justify-between">
        <h3 className="font-semibold text-[#000080]">Bank Partners</h3>
        <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#138808] text-white text-sm hover:bg-[#0f6d06] transition-colors"><Plus className="w-4 h-4" /> Add Bank</button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="bg-gray-50">
            <th className="text-left px-4 py-3 font-medium text-gray-600">Bank Name</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">Type</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">District</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">NPA %</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">Funds</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">Disbursed</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">Actions</th>
          </tr></thead>
          <tbody>
            {SAMPLE_BANKS.length === 0 ? (<tr><td colSpan="5" className="px-4 py-8 text-center text-gray-400">No bank partners available. Data will appear when loaded from the backend.</td></tr>) : SAMPLE_BANKS.map(function(b) {
              return (
                <tr key={b.id} className="border-t border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900">{b.name}</td>
                  <td className="px-4 py-3 text-gray-600">{b.type}</td>
                  <td className="px-4 py-3 text-gray-600">{b.district}, {b.state}</td>
                  <td className="px-4 py-3"><span className={"text-sm font-medium " + (b.npa > 5 ? "text-red-600" : "text-[#138808]")}>{b.npa}%</span></td>
                  <td className="px-4 py-3"><span className={"px-2 py-1 rounded-full text-xs font-medium " + (b.fundsAvailable ? "bg-[#138808]/10 text-[#138808]" : "bg-red-100 text-red-600")}>{b.fundsAvailable ? "Available" : "Depleted"}</span></td>
                  <td className="px-4 py-3 text-gray-600">{(b.disbursed/100000).toFixed(0)}L</td>
                  <td className="px-4 py-3"><button className="text-[#138808] hover:underline text-xs"><Edit3 className="w-4 h-4 inline" /> Edit</button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ActivityTab() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
      <h3 className="font-semibold text-[#000080] mb-4">Full Activity Log</h3>
      <div className="space-y-4">
        {ACTIVITY_LOG.map(function(item) {
          var borderColor = item.type === "alert" ? "border-l-[#FF9933]" : "border-l-[#138808]";
          return (
            <div key={item.id} className={"border-l-4 " + borderColor + " pl-4 py-2"}>
              <p className="font-medium text-gray-900 text-sm">{item.action}</p>
              <p className="text-gray-600 text-sm">{item.detail}</p>
              <p className="text-gray-400 text-xs mt-1">{item.time}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
export default function AdminDashboard() {
  var [tab, setTab] = useState("overview");
  var [adminPhone, setAdminPhone] = useState(sessionStorage.getItem("admin_phone") || "Admin");
  var [stats, setStats] = useState({
    totalUsers: 0,
    totalSchemes: 0,
    totalBanks: 0,
    disbursed: '₹0'
  });

  useEffect(function() {
    setAdminPhone(sessionStorage.getItem("admin_phone") || "Unknown");
  }, []);

  function handleLogout() {
    sessionStorage.removeItem("admin_auth");
    sessionStorage.removeItem("admin_phone");
    window.location.href = "/admin";
  }

  var tabs = [
    {id: "overview", label: "Overview", IC: LayoutDashboard},
    {id: "users", label: "Users", IC: Users},
    {id: "schemes", label: "Schemes", IC: FileText},
    {id: "banks", label: "Banks", IC: Building2},
    {id: "activity", label: "Activity", IC: Activity},
  ];

  return (
    <div className="min-h-screen relative p-4 sm:p-0">
      <PageBackdrop variant="dashboard" />
      <div aria-hidden="true" className="cs-orb cs-orb-green w-[380px] h-[380px] -top-40 right-[-8%] opacity-50" />
      <div aria-hidden="true" className="cs-orb cs-orb-saffron w-[320px] h-[320px] bottom-[-10%] left-[-6%] opacity-40" />
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#138808] flex items-center justify-center"><Shield className="w-5 h-5 text-white" /></div>
          <div>
            <h1 className="text-lg font-bold text-[#000080]">CreditSetu Admin Panel</h1>
            <p className="text-xs text-gray-500">Logged in as {adminPhone}</p>
          </div>
        </div>
        <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors text-sm">
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </div>
      <div className="flex border-b border-gray-200 bg-white px-6 overflow-x-auto">
        {tabs.map(function(t) {
          return (
            <button key={t.id} onClick={function(){setTab(t.id)}} className={"flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap " + (tab === t.id ? "border-[#138808] text-[#138808]" : "border-transparent text-gray-500 hover:text-gray-700")}>
              <t.IC className="w-4 h-4" /> {t.label}
            </button>
          );
        })}
      </div>
      <div className="p-6">
        {tab === "overview" && <OverviewTab stats={stats} />}
        {tab === "users" && <UsersTab />}
        {tab === "schemes" && <SchemesTab />}
        {tab === "banks" && <BanksTab />}
        {tab === "activity" && <ActivityTab />}
      </div>
    </div>
  );
}
