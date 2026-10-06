import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, TextInput, ScrollView, Alert, Share } from 'react-native';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('home'); 
  const [bhishiType, setBhishiType] = useState('Bidding (Lilaav Bhishi)');
  const [groupName, setGroupName] = useState('');
  const [monthlyAmount, setMonthlyAmount] = useState('');
  const [paymentMode, setPaymentMode] = useState('Lilaavanantar gola karto');

  const [groups, setGroups] = useState([
    {
      id: '1',
      name: 'Kajale Saraf',
      type: 'BIDDING',
      contribution: 10000,
      paymentMode: 'Lilaavanantar gola karto',
      members: [],
      auctions: [],
      completedRounds: 0
    }
  ]);

  const [selectedGroup, setSelectedGroup] = useState(null);
  const [newMemberName, setNewMemberName] = useState('');
  const [selectedWinner, setSelectedWinner] = useState('');
  const [bidAmountInput, setBidAmountInput] = useState('');
  const [editGroupName, setEditGroupName] = useState('');

  // Sync / Import Data State
  const [importCodeInput, setImportCodeInput] = useState('');

  // States for editing ALL columns of a past auction manually
  const [editingAuctionIndex, setEditingAuctionIndex] = useState(null);
  const [editRoundInput, setEditRoundInput] = useState('');
  const [editWinnerInput, setEditWinnerInput] = useState('');
  const [editBidInput, setEditBidInput] = useState('');
  const [editDividendInput, setEditDividendInput] = useState('');
  const [editFinalCollectInput, setEditFinalCollectInput] = useState('');
  const [editWinnerPayoutInput, setEditWinnerPayoutInput] = useState('');

  const handleCreateGroup = () => {
    if (!groupName.trim() || !monthlyAmount.trim()) {
      Alert.alert('Chuk', 'Krupaya groupche nav ani monthly rakam naki bhara.');
      return;
    }
    const newG = {
      id: Date.now().toString(),
      name: groupName,
      type: bhishiType.includes('Lilaav') ? 'BIDDING' : 'LUCKY DRAW',
      contribution: parseFloat(monthlyAmount),
      paymentMode: paymentMode,
      members: [],
      auctions: [],
      completedRounds: 0
    };
    setGroups([...groups, newG]);
    setGroupName('');
    setMonthlyAmount('');
    setCurrentScreen('home');
  };

  const handleAddMember = () => {
    if (!newMemberName.trim()) {
      Alert.alert('Chuk', 'Sadasyache nav taka.');
      return;
    }
    const updatedGroups = groups.map((g) => {
      if (g.id === selectedGroup.id) {
        const updatedMembers = [...g.members, newMemberName.trim()];
        const updatedObj = { ...g, members: updatedMembers };
        setSelectedGroup(updatedObj);
        return updatedObj;
      }
      return g;
    });
    setGroups(updatedGroups);
    setNewMemberName('');
    setCurrentScreen('detail');
  };

  const handleSaveAuction = () => {
    if (!selectedWinner || !bidAmountInput) {
      Alert.alert('Chuk', 'Vijeta ani boli rakam (Bid amount) select kara.');
      return;
    }

    const bid = parseFloat(bidAmountInput);
    const contribution = selectedGroup.contribution;
    const totalMembers = selectedGroup.members.length;

    if (totalMembers === 0) {
      Alert.alert('Chuk', 'Group madhe ajun ekpan member nahi ahe. Krupaya aadhi member joda.');
      return;
    }

    const perMemberDividend = bid / totalMembers;
    const finalCollectPerMember = contribution - perMemberDividend;
    const totalPoolCollected = finalCollectPerMember * totalMembers;
    const winnerPayout = totalPoolCollected - finalCollectPerMember;

    const currentRound = selectedGroup.completedRounds + 1;
    const newAuctionRecord = {
      round: currentRound,
      winner: selectedWinner,
      bidAmount: bid,
      perMemberDividend: perMemberDividend.toFixed(2),
      finalCollect: finalCollectPerMember.toFixed(2),
      winnerPayout: winnerPayout.toFixed(2),
      totalPool: totalPoolCollected
    };

    const updatedAuctions = [...selectedGroup.auctions, newAuctionRecord];
    const maxRound = updatedAuctions.reduce((max, a) => Math.max(max, a.round), 0);

    const updatedGroups = groups.map((g) => {
      if (g.id === selectedGroup.id) {
        const updatedObj = {
          ...g,
          completedRounds: maxRound,
          auctions: updatedAuctions
        };
        setSelectedGroup(updatedObj);
        return updatedObj;
      }
      return g;
    });

    setGroups(updatedGroups);
    setSelectedWinner('');
    setBidAmountInput('');
    setCurrentScreen('detail');
  };

  const handleUpdateAuction = () => {
    if (!editRoundInput.trim() || !editWinnerInput.trim() || !editBidInput.trim() || !editDividendInput.trim() || !editFinalCollectInput.trim() || !editWinnerPayoutInput.trim()) {
      Alert.alert('Chuk', 'Krupaya sagle fields naki bhara.');
      return;
    }

    const updatedAuctions = selectedGroup.auctions.map((auc, idx) => {
      if (idx === editingAuctionIndex) {
        return {
          ...auc,
          round: parseInt(editRoundInput, 10),
          winner: editWinnerInput.trim(),
          bidAmount: parseFloat(editBidInput),
          perMemberDividend: parseFloat(editDividendInput).toFixed(2),
          finalCollect: parseFloat(editFinalCollectInput).toFixed(2),
          winnerPayout: parseFloat(editWinnerPayoutInput).toFixed(2),
        };
      }
      return auc;
    });

    const maxRound = updatedAuctions.reduce((max, a) => Math.max(max, a.round), 0);

    const updatedGroups = groups.map((g) => {
      if (g.id === selectedGroup.id) {
        const updatedObj = {
          ...g,
          completedRounds: maxRound,
          auctions: updatedAuctions
        };
        setSelectedGroup(updatedObj);
        return updatedObj;
      }
      return g;
    });

    setGroups(updatedGroups);
    setEditingAuctionIndex(null);
    setEditRoundInput('');
    setEditWinnerInput('');
    setEditBidInput('');
    setEditDividendInput('');
    setEditFinalCollectInput('');
    setEditWinnerPayoutInput('');
    Alert.alert('Yashaswi', 'Sagle columns safaltapoorvak update zale ahet!');
  };

  const handleDeleteAuction = (indexToRemove) => {
    Alert.alert(
      'Lilaav Delete Kara',
      'Tumhala nakki ha lilaav delete karaycha ahe ka?',
      [
        { text: 'Nahi', style: 'cancel' },
        { 
          text: 'Ho, Delete Kara', 
          style: 'destructive',
          onPress: () => {
            const updatedAuctions = selectedGroup.auctions.filter((_, idx) => idx !== indexToRemove);
            const maxRound = updatedAuctions.length > 0 
              ? updatedAuctions.reduce((max, a) => Math.max(max, a.round), 0) 
              : 0;

            const updatedGroups = groups.map((g) => {
              if (g.id === selectedGroup.id) {
                const updatedObj = {
                  ...g,
                  completedRounds: maxRound,
                  auctions: updatedAuctions
                };
                setSelectedGroup(updatedObj);
                return updatedObj;
              }
              return g;
            });

            setGroups(updatedGroups);
            Alert.alert('Yashaswi', 'Lilaav safaltapoorvak delete kela gela ahe.');
          }
        }
      ]
    );
  };

  const handleShareAuction = async (auc) => {
    try {
      const message = `📊 *Bhishi Report - Bhishi No ${auc.round}* (${selectedGroup.name})\n\n` +
        `🏆 Vijeta: ${auc.winner}\n` +
        `📉 Lilaav Rakam: ₹${auc.bidAmount}\n` +
        `🎁 Pratyekala Milnara Dividend: ₹${auc.perMemberDividend}\n` +
        `💰 Pratyekane Bharaychi Rakam: ₹${auc.finalCollect}\n` +
        `💸 Vijetyala Milnari Rakam: ₹${auc.winnerPayout}`;

      await Share.share({ message: message });
    } catch (error) {
      Alert.alert('Chuk', error.message);
    }
  };

  // Export Data String for Syncing to other Device
  const handleExportData = async () => {
    try {
      const jsonString = JSON.stringify(groups);
      await Share.share({
        message: `BhishiBook Sync Code:\n${jsonString}`
      });
    } catch (error) {
      Alert.alert('Chuk', error.message);
    }
  };

  // Import Data String from another Device
  const handleImportData = () => {
    try {
      if (!importCodeInput.trim()) {
        Alert.alert('Chuk', 'Krupaya sync code paste kara.');
        return;
      }
      const parsedData = JSON.parse(importCodeInput.trim());
      if (Array.isArray(parsedData)) {
        setGroups(parsedData);
        Alert.alert('Yashaswi', 'Dusrya device varla sagle groups ani data successfully sync zala ahe!');
        setCurrentScreen('home');
      } else {
        Alert.alert('Chuk', 'Codeayogya ahe.');
      }
    } catch (e) {
      Alert.alert('Chuk', 'Valid JSON sync code taka.');
    }
  };

  if (currentScreen === 'home') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.topHeader}>
          <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
            <Text style={styles.appTitle}>BhishiBook</Text>
            <TouchableOpacity style={styles.qrLinkTopBtn} onPress={() => setCurrentScreen('device_sync')}>
              <Text style={{color: '#007aff', fontWeight: 'bold', fontSize: 13}}>🔄 Sync / Link Device</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.welcomeText}>👋 Namaskar, Yash Kajale!</Text>
        </View>

        <ScrollView style={styles.body}>
          <Text style={styles.sectionHeading}>Tumche Groups</Text>

          {groups.map((item) => {
            const totalGroupAmount = item.contribution * item.members.length;
            return (
              <View key={item.id} style={styles.groupCard}>
                <View style={styles.cardTopRow}>
                  <Text style={styles.groupCardTitle}>{item.name}</Text>
                  <View style={styles.badge}><Text style={styles.badgeText}>{item.type}</Text></View>
                </View>
                <Text style={styles.cardSubText}>Ekun Pool Rakam: ₹{totalGroupAmount} ( Mahina: ₹{item.contribution} )</Text>
                <Text style={styles.cardCountText}>👥 {item.members.length} sadasya • {item.completedRounds} bhishi nos purna ✅</Text>

                <TouchableOpacity 
                  style={styles.viewDetailsBtn} 
                  onPress={() => { setSelectedGroup(item); setCurrentScreen('detail'); }}
                >
                  <Text style={styles.viewDetailsText}>Tapshil Paha</Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </ScrollView>

        <TouchableOpacity style={styles.fab} onPress={() => setCurrentScreen('create_step1')}>
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>

        <View style={styles.bottomNav}>
          <Text style={styles.navActive}>🏠 Groups</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (currentScreen === 'device_sync') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.headerBar}>
          <TouchableOpacity onPress={() => setCurrentScreen('home')}><Text style={styles.backArrow}>←</Text></TouchableOpacity>
          <Text style={styles.headerTitleText}>Device Sync & Share</Text>
        </View>
        <ScrollView style={styles.stepBody}>
          <View style={styles.qrContainerBox}>
            <Text style={{fontSize: 18, fontWeight: 'bold', color: '#111', textAlign: 'center', marginBottom: 10}}>
              📱 Dusrya Device madhe Data Transfer Kara
            </Text>
            <Text style={{fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 20, lineHeight: 20}}>
              Camera scan madhe adchan yet aslyamule, tumhi WhatsApp kinva Message dwara data share karun ekach click madhe dusrya device madhe data gheu shakta.
            </Text>

            <TouchableOpacity style={[styles.primaryBtn, {backgroundColor: '#27ae60', marginTop: 5, width: '100%'}]} onPress={handleExportData}>
              <Text style={styles.primaryBtnText}>📤 Data Export / Share Kara</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.qrContainerBox, {marginTop: 20}]}>
            <Text style={{fontSize: 16, fontWeight: 'bold', color: '#111', marginBottom: 10, alignSelf: 'flex-start'}}>
              📥 Dusrya Device varun Data Import Kara:
            </Text>
            <TextInput 
              style={[styles.textInputBox, {height: 100, textAlignVertical: 'top'}]} 
              placeholder="Yithe sync code paste kara..." 
              multiline={true}
              value={importCodeInput} 
              onChangeText={setImportCodeInput} 
            />
            <TouchableOpacity style={[styles.primaryBtn, {marginTop: 15, width: '100%'}]} onPress={handleImportData}>
              <Text style={styles.primaryBtnText}>📥 Data Import Kara</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (currentScreen === 'create_step1') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.headerBar}>
          <TouchableOpacity onPress={() => setCurrentScreen('home')}><Text style={styles.backArrow}>←</Text></TouchableOpacity>
          <Text style={styles.headerTitleText}>Bhishi Taiyar Kara</Text>
        </View>
        <View style={styles.stepBody}>
          <Text style={styles.stepIndicator}>Step 1 paiki 3</Text>
          <Text style={styles.stepHeading}>Bhishi Prakar</Text>
          <TouchableOpacity style={[styles.typeCard, bhishiType.includes('Bidding') && styles.selectedTypeCard]} onPress={() => setBhishiType('Bidding (Lilaav Bhishi)')}>
            <Text style={styles.typeTitle}>Bidding (Lilaav Bhishi)</Text>
            <Text style={styles.typeDesc}>Sadasya boli lavtat – sarvat kami boli lavnara jinkto</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.primaryBtn} onPress={() => setCurrentScreen('create_step2')}>
            <Text style={styles.primaryBtnText}>Pudhe →</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (currentScreen === 'create_step2') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.headerBar}>
          <TouchableOpacity onPress={() => setCurrentScreen('create_step1')}><Text style={styles.backArrow}>←</Text></TouchableOpacity>
          <Text style={styles.headerTitleText}>Bhishi Taiyar Kara</Text>
        </View>
        <View style={styles.stepBody}>
          <Text style={styles.stepIndicator}>Step 2 paiki 4</Text>
          <Text style={styles.stepHeading}>Group Che Nav</Text>
          <TextInput style={styles.textInputBox} placeholder="Uda. Kajale Saraf" value={groupName} onChangeText={setGroupName} />
          <TouchableOpacity style={styles.primaryBtn} onPress={() => setCurrentScreen('create_step3')}>
            <Text style={styles.primaryBtnText}>Pudhe →</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (currentScreen === 'create_step3') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.headerBar}>
          <TouchableOpacity onPress={() => setCurrentScreen('create_step2')}><Text style={styles.backArrow}>←</Text></TouchableOpacity>
          <Text style={styles.headerTitleText}>Bhishi Taiyar Kara</Text>
        </View>
        <View style={styles.stepBody}>
          <Text style={styles.stepIndicator}>Step 3 paiki 4</Text>
          <Text style={styles.stepHeading}>Monthly Rakam</Text>
          <TextInput style={styles.textInputBox} placeholder="Uda. 10000" keyboardType="numeric" value={monthlyAmount} onChangeText={setMonthlyAmount} />
          <TouchableOpacity style={styles.primaryBtn} onPress={() => setCurrentScreen('create_step4')}>
            <Text style={styles.primaryBtnText}>Pudhe →</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (currentScreen === 'create_step4') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.headerBar}>
          <TouchableOpacity onPress={() => setCurrentScreen('create_step3')}><Text style={styles.backArrow}>←</Text></TouchableOpacity>
          <Text style={styles.headerTitleText}>Bhishi Taiyar Kara</Text>
        </View>
        <View style={styles.stepBody}>
          <Text style={styles.stepIndicator}>Step 4 paiki 4</Text>
          <Text style={styles.stepHeading}>Lilavantr Ki Aadhi Gola Karne</Text>
          
          <TouchableOpacity style={[styles.methodCard, paymentMode.includes('Lilaavanantar') && styles.selectedTypeCard]} onPress={() => setPaymentMode('Lilaavanantar gola karto')}>
            <Text style={styles.typeTitle}>💰 Lilaavanantar Gola Karto</Text>
            <Text style={styles.typeDesc}>Adhi lilaav hoto, mag kami paise gola kele jatat.</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.primaryBtnFinal} onPress={handleCreateGroup}>
            <Text style={styles.primaryBtnText}>Group Taiyar Kara</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (currentScreen === 'add_member') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.headerBar}>
          <TouchableOpacity onPress={() => setCurrentScreen('detail')}><Text style={styles.backArrow}>←</Text></TouchableOpacity>
          <Text style={styles.headerTitleText}>Member Joda</Text>
        </View>
        <View style={styles.stepBody}>
          <Text style={styles.stepHeading}>Sadasyache Nav</Text>
          <TextInput style={styles.textInputBox} placeholder="Uda. Santosh Kajale" value={newMemberName} onChangeText={setNewMemberName} />
          <TouchableOpacity style={styles.primaryBtn} onPress={handleAddMember}>
            <Text style={styles.primaryBtnText}>Member Save Kara</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (currentScreen === 'add_auction') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.headerBar}>
          <TouchableOpacity onPress={() => setCurrentScreen('detail')}><Text style={styles.backArrow}>←</Text></TouchableOpacity>
          <Text style={styles.headerTitleText}>Lilaav Nondva (Bhishi No {selectedGroup.completedRounds + 1})</Text>
        </View>
        <ScrollView style={styles.stepBody}>
          <Text style={styles.stepHeading}>Vijeta Nivda (Winner)</Text>
          {selectedGroup.members.length === 0 ? (
            <Text style={{color: 'red', marginVertical: 10, fontSize: 16}}>Ajun ekhpan member add kelela nahi!</Text>
          ) : (
            selectedGroup.members.map((mem, idx) => (
              <TouchableOpacity 
                key={idx} 
                style={[styles.memberSelectBtn, selectedWinner === mem && styles.selectedTypeCard]} 
                onPress={() => setSelectedWinner(mem)}
              >
                <Text style={styles.typeTitle}>👤 {mem}</Text>
              </TouchableOpacity>
            ))
          )}

          <Text style={[styles.stepHeading, {marginTop: 20}]}>Bid Amount (Boli Rakam)</Text>
          <TextInput style={styles.textInputBox} placeholder="Uda. 2000" keyboardType="numeric" value={bidAmountInput} onChangeText={setBidAmountInput} />

          <TouchableOpacity style={styles.primaryBtn} onPress={handleSaveAuction}>
            <Text style={styles.primaryBtnText}>Save & Calculate Kara</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (currentScreen === 'settings') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.headerBar}>
          <TouchableOpacity onPress={() => setCurrentScreen('detail')}><Text style={styles.backArrow}>←</Text></TouchableOpacity>
          <Text style={styles.headerTitleText}>Group Settings</Text>
        </View>
        <View style={styles.stepBody}>
          <Text style={styles.stepHeading}>Group Nav Edit Kara</Text>
          <TextInput style={styles.textInputBox} placeholder={selectedGroup.name} value={editGroupName} onChangeText={setEditGroupName} />
          
          <TouchableOpacity style={styles.primaryBtn} onPress={() => {
            if(editGroupName) {
              const updated = groups.map(g => g.id === selectedGroup.id ? {...g, name: editGroupName} : g);
              setGroups(updated);
              setSelectedGroup({...selectedGroup, name: editGroupName});
              Alert.alert('Yashaswi', 'Nav badalale ahe.');
              setCurrentScreen('detail');
            }
          }}>
            <Text style={styles.primaryBtnText}>Nav Update Kara</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.primaryBtn, {backgroundColor: '#e74c3c', marginTop: 30}]} onPress={() => {
            const filtered = groups.filter(g => g.id !== selectedGroup.id);
            setGroups(filtered);
            setCurrentScreen('home');
          }}>
            <Text style={styles.primaryBtnText}>Group Delete Kara 🗑</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (currentScreen === 'dividend_detail') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.headerBar}>
          <TouchableOpacity onPress={() => setCurrentScreen('detail')}><Text style={styles.backArrow}>←</Text></TouchableOpacity>
          <Text style={styles.headerTitleText}>Dividend Tapshil & History</Text>
        </View>
        <ScrollView style={styles.stepBody}>
          {selectedGroup.auctions.length === 0 ? (
            <Text style={{textAlign: 'center', color: '#666', marginTop: 30, fontSize: 16}}>Ajun konta hi lilaav zala nahi.</Text>
          ) : (
            selectedGroup.auctions.map((auc, i) => (
              <View key={i} style={styles.auctionCard}>
                <Text style={styles.typeTitle}>Bhishi No. {auc.round}</Text>
                <Text style={styles.cardSubText}>🏆 Vijeta: <Text style={{fontWeight: 'bold'}}>{auc.winner}</Text></Text>
                <Text style={styles.cardSubText}>📉 Lilaav Rakam (Bid): ₹{auc.bidAmount}</Text>
                <Text style={styles.cardSubText}>🎁 Pratyekala Vatlela Dividend: ₹{auc.perMemberDividend}</Text>
                <Text style={[styles.cardSubText, {color: '#27ae60', fontWeight: 'bold', fontSize: 16}]}>💰 Pratyekane bharaychi rakam: ₹{auc.finalCollect}</Text>
                <Text style={[styles.cardSubText, {color: '#8e44ad', fontWeight: 'bold', fontSize: 15}]}>💸 Vijetyala milnari rakam: ₹{auc.winnerPayout}</Text>

                {editingAuctionIndex === i ? (
                  <View style={styles.editSection}>
                    <Text style={{fontWeight: 'bold', marginTop: 5, color: '#333'}}>Bhishi No (Round):</Text>
                    <TextInput style={styles.textInputBox} keyboardType="numeric" value={editRoundInput} onChangeText={setEditRoundInput} />

                    <Text style={{fontWeight: 'bold', marginTop: 10, color: '#333'}}>Vijeta Nav (Winner):</Text>
                    <TextInput style={styles.textInputBox} value={editWinnerInput} onChangeText={setEditWinnerInput} />

                    <Text style={{fontWeight: 'bold', marginTop: 10, color: '#333'}}>Bid Amount (Lilaav Rakam):</Text>
                    <TextInput style={styles.textInputBox} keyboardType="numeric" value={editBidInput} onChangeText={setEditBidInput} />

                    <Text style={{fontWeight: 'bold', marginTop: 10, color: '#333'}}>Pratyekala Dividend:</Text>
                    <TextInput style={styles.textInputBox} keyboardType="numeric" value={editDividendInput} onChangeText={setEditDividendInput} />

                    <Text style={{fontWeight: 'bold', marginTop: 10, color: '#333'}}>Pratyekane Bharaychi Rakam:</Text>
                    <TextInput style={styles.textInputBox} keyboardType="numeric" value={editFinalCollectInput} onChangeText={setEditFinalCollectInput} />

                    <Text style={{fontWeight: 'bold', marginTop: 10, color: '#333'}}>Vijetyala Milnari Rakam:</Text>
                    <TextInput style={styles.textInputBox} keyboardType="numeric" value={editWinnerPayoutInput} onChangeText={setEditWinnerPayoutInput} />

                    <View style={{flexDirection: 'row', justifyContent: 'space-between', marginTop: 12}}>
                      <TouchableOpacity style={[styles.primaryBtn, {flex: 1, marginRight: 5, backgroundColor: '#27ae60', padding: 12, marginTop: 0}]} onPress={handleUpdateAuction}>
                        <Text style={{color: '#fff', fontWeight: 'bold'}}>Save</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={[styles.primaryBtn, {flex: 1, marginLeft: 5, backgroundColor: '#95a5a6', padding: 12, marginTop: 0}]} onPress={() => setEditingAuctionIndex(null)}>
                        <Text style={{color: '#fff', fontWeight: 'bold'}}>Cancel</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <TouchableOpacity style={styles.editButton} onPress={() => { 
                    setEditingAuctionIndex(i); 
                    setEditRoundInput(auc.round.toString());
                    setEditWinnerInput(auc.winner);
                    setEditBidInput(auc.bidAmount.toString()); 
                    setEditDividendInput(auc.perMemberDividend.toString());
                    setEditFinalCollectInput(auc.finalCollect.toString());
                    setEditWinnerPayoutInput(auc.winnerPayout.toString());
                  }}>
                    <Text style={styles.editText}>✏️ Sagle Column Edit Kara</Text>
                  </TouchableOpacity>
                )}
                
                <TouchableOpacity style={styles.shareButton} onPress={() => handleShareAuction(auc)}>
                  <Text style={styles.shareText}>📤 Tapshil Share Kara</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.deleteAuctionButton} onPress={() => handleDeleteAuction(i)}>
                  <Text style={styles.deleteAuctionText}>🗑️ Lilaav Delete Kara</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (currentScreen === 'detail' && selectedGroup) {
    const currentRound = selectedGroup.completedRounds + 1;
    const lastAuction = selectedGroup.auctions.length > 0 ? selectedGroup.auctions[selectedGroup.auctions.length - 1] : null;
    const totalGroupAmount = selectedGroup.contribution * selectedGroup.members.length;
    const isAllRoundsFinished = selectedGroup.members.length > 0 && selectedGroup.completedRounds >= selectedGroup.members.length;

    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.headerBar}>
          <TouchableOpacity onPress={() => setCurrentScreen('home')}><Text style={styles.backArrow}>←</Text></TouchableOpacity>
          <View>
            <Text style={styles.headerTitleText}>{selectedGroup.name}</Text>
            <Text style={styles.subHeaderType}>Bidding group</Text>
          </View>
          <TouchableOpacity onPress={() => setCurrentScreen('settings')}><Text style={styles.historyText}>⚙ Settings</Text></TouchableOpacity>
        </View>

        <View style={styles.statsBar}>
          <View style={styles.statItem}><Text style={styles.statNum}>{selectedGroup.members.length}</Text><Text style={styles.statLabel}>MEMBERS</Text></View>
          <View style={styles.statItem}><Text style={styles.statNum}>₹{totalGroupAmount}</Text><Text style={styles.statLabel}>AMOUNT</Text></View>
          <View style={styles.statItem}><Text style={styles.statNum}>{selectedGroup.completedRounds}</Text><Text style={styles.statLabel}>BHISHI NOS</Text></View>
        </View>

        <ScrollView style={styles.detailBody}>
          <View style={styles.roundHeaderRow}>
            <Text style={styles.roundHeading}>Bhishi No: {currentRound}</Text>
            <TouchableOpacity style={styles.smallPlusBtn} onPress={() => setCurrentScreen('add_auction')}>
              <Text style={{color: '#fff', fontWeight: 'bold', fontSize: 14}}>+ Lilaav Nondva</Text>
            </TouchableOpacity>
          </View>

          {!isAllRoundsFinished ? (
            <View style={styles.auctionCard}>
              <View style={styles.auctionRow}>
                <Text style={styles.hammerIcon}>🔨</Text>
                <View>
                  <Text style={styles.auctionTitle}>Lilaav baki aahe</Text>
                  <Text style={styles.auctionSub}>Bhishi No {currentRound} sathi auction pending aahe</Text>
                </View>
              </View>

              <View style={styles.auctionInfoBoxes}>
                <View style={styles.infoBox}>
                  <Text style={styles.infoBoxLabel}>Magil Vijeta</Text>
                  <Text style={styles.infoBoxVal}>{lastAuction ? lastAuction.winner : '— (Pahila Bhishi No)'}</Text>
                </View>
                {lastAuction && (
                  <View style={styles.infoBox}>
                    <Text style={styles.infoBoxLabel}>Pratyekane Gola Karayche</Text>
                    <Text style={[styles.infoBoxVal, {color: '#27ae60'}]}>₹{lastAuction.finalCollect}</Text>
                  </View>
                )}
              </View>
            </View>
          ) : (
            <Text style={{textAlign: 'center', fontWeight: 'bold', color: '#27ae60', marginVertical: 10, fontSize: 16}}>Sagle bhishi nos purna zale aahet! 🎉</Text>
          )}

          <TouchableOpacity style={styles.dividendBtn} onPress={() => setCurrentScreen('dividend_detail')}>
            <Text style={styles.dividendBtnText}>📊 Dividend Tapshil & History Paha</Text>
          </TouchableOpacity>

          <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 15}}>
            <Text style={styles.paymentsTitle}>Member List ({selectedGroup.members.length})</Text>
            <TouchableOpacity onPress={() => setCurrentScreen('add_member')}><Text style={{color: '#007aff', fontWeight: 'bold', fontSize: 14}}>+ Member Joda</Text></TouchableOpacity>
          </View>

          {selectedGroup.members.length === 0 ? (
            <Text style={{color: '#888', marginTop: 10, fontSize: 14, fontStyle: 'italic'}}>Ajun konta hi member jodla nahi ahe.</Text>
          ) : (
            selectedGroup.members.map((member, idx) => (
              <View key={idx} style={styles.memberPaymentCard}>
                <View style={styles.memberAvatar}><Text style={styles.avatarText}>{member.substring(0, 2).toUpperCase()}</Text></View>
                <View style={styles.memberInfoCol}>
                  <Text style={styles.memberName}>{member}</Text>
                  <Text style={styles.memberAmt}>Monthly: ₹{selectedGroup.contribution}</Text>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f6fc' },
  topHeader: { backgroundColor: '#fff', padding: 18, borderBottomWidth: 1, borderBottomColor: '#eee' },
  appTitle: { fontSize: 26, fontWeight: 'bold', color: '#111' },
  welcomeText: { fontSize: 15, color: '#666', marginTop: 4 },
  qrLinkTopBtn: { backgroundColor: '#e0f0ff', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  qrContainerBox: { backgroundColor: '#fff', padding: 20, borderRadius: 16, borderWidth: 1, borderColor: '#ddd' },
  body: { flex: 1, padding: 16 },
  sectionHeading: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 14 },
  groupCard: { backgroundColor: '#eef6f0', padding: 18, borderRadius: 14, marginBottom: 16, borderWidth: 1, borderColor: '#d4ebd9' },
  cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  groupCardTitle: { fontSize: 20, fontWeight: 'bold', color: '#111' },
  badge: { backgroundColor: '#e0f0ff', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  badgeText: { fontSize: 12, fontWeight: 'bold', color: '#007aff' },
  cardSubText: { fontSize: 15, color: '#444', marginTop: 6 },
  cardCountText: { fontSize: 14, color: '#666', marginTop: 6, marginBottom: 14 },
  viewDetailsBtn: { backgroundColor: '#007aff', padding: 12, borderRadius: 10, alignItems: 'center' },
  viewDetailsText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  fab: { position: 'absolute', right: 20, bottom: 30, backgroundColor: '#007aff', width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center', elevation: 6 },
  fabText: { color: '#fff', fontSize: 36, fontWeight: 'bold' },
  bottomNav: { flexDirection: 'row', backgroundColor: '#fff', paddingVertical: 14, justifyContent: 'center', borderTopWidth: 1, borderTopColor: '#eee' },
  navActive: { fontSize: 16, fontWeight: 'bold', color: '#007aff' },
  headerBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 18, borderBottomWidth: 1, borderBottomColor: '#eee', justifyContent: 'space-between' },
  backArrow: { fontSize: 26, fontWeight: 'bold', color: '#111', marginRight: 15 },
  headerTitleText: { fontSize: 20, fontWeight: 'bold', color: '#111' },
  stepBody: { flex: 1, padding: 20 },
  stepIndicator: { fontSize: 14, color: '#888', fontWeight: 'bold', marginBottom: 6 },
  stepHeading: { fontSize: 24, fontWeight: 'bold', color: '#111', marginBottom: 8 },
  typeCard: { backgroundColor: '#fff', padding: 18, borderRadius: 14, borderWidth: 1, borderColor: '#ddd', marginBottom: 14 },
  selectedTypeCard: { borderColor: '#007aff', backgroundColor: '#f0f6ff' },
  typeTitle: { fontSize: 18, fontWeight: 'bold', color: '#111' },
  typeDesc: { fontSize: 14, color: '#666', marginTop: 6 },
  primaryBtn: { backgroundColor: '#007aff', padding: 16, borderRadius: 14, alignItems: 'center' },
  primaryBtnFinal: { backgroundColor: '#007aff', padding: 18, borderRadius: 14, alignItems: 'center', marginTop: 40 },
  primaryBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  textInputBox: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', borderRadius: 14, padding: 16, fontSize: 16, color: '#111', marginTop: 10 },
  subHeaderType: { fontSize: 13, color: '#666' },
  historyText: { fontSize: 15, color: '#007aff', fontWeight: 'bold' },
  statsBar: { flexDirection: 'row', backgroundColor: '#007aff', paddingVertical: 12, justifyContent: 'space-around' },
  statItem: { alignItems: 'center' },
  statNum: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  statLabel: { color: '#d0e1fd', fontSize: 11, fontWeight: 'bold' },
  detailBody: { flex: 1, padding: 16 },
  roundHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 12 },
  roundHeading: { fontSize: 18, fontWeight: 'bold', color: '#111' },
  smallPlusBtn: { backgroundColor: '#27ae60', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
  auctionCard: { backgroundColor: '#f2eeff', borderRadius: 14, padding: 18, borderWidth: 1, borderColor: '#d9cdff', marginBottom: 14 },
  auctionRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  hammerIcon: { fontSize: 28, marginRight: 12 },
  auctionTitle: { fontSize: 17, fontWeight: 'bold', color: '#333' },
  auctionSub: { fontSize: 13, color: '#666' },
  auctionInfoBoxes: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  infoBox: { backgroundColor: '#fff', flex: 1, marginHorizontal: 6, padding: 12, borderRadius: 10, alignItems: 'center' },
  infoBoxLabel: { fontSize: 12, color: '#666', textAlign: 'center' },
  infoBoxVal: { fontSize: 15, fontWeight: 'bold', color: '#111', marginTop: 6, textAlign: 'center' },
  dividendBtn: { backgroundColor: '#8e44ad', padding: 16, borderRadius: 12, alignItems: 'center', marginVertical: 10 },
  dividendBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  paymentsTitle: { fontSize: 16, fontWeight: 'bold', color: '#111', marginBottom: 10 },
  memberPaymentCard: { backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#eee' },
  memberAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#fff3cd', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avatarText: { fontSize: 15, fontWeight: 'bold', color: '#856404' },
  memberInfoCol: { flex: 1 },
  memberName: { fontSize: 16, fontWeight: 'bold', color: '#111' },
  memberAmt: { fontSize: 14, color: '#666' },
  memberSelectBtn: { backgroundColor: '#fff', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#ddd', marginBottom: 10 },
  shareButton: { backgroundColor: '#27ae60', padding: 12, borderRadius: 10, alignItems: 'center', marginTop: 12 },
  shareText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  editButton: { backgroundColor: '#d35400', padding: 10, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  editText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  editSection: { marginTop: 10, backgroundColor: '#fff', padding: 10, borderRadius: 10, borderWidth: 1, borderColor: '#ddd' },
  deleteAuctionButton: { backgroundColor: '#c0392b', padding: 10, borderRadius: 10, alignItems: 'center', marginTop: 8 },
  deleteAuctionText: { color: '#fff', fontWeight: 'bold', fontSize: 14 }
});